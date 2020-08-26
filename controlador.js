var express = require('express');
var router = express.Router();
var modelos = require('../../modelos');
var FCM = require('../FCM');
var Impresion = require('../Impresion/funcionalidades.js')
var Sequelize = require('sequelize');
var settings = require('../../settings.js');
var sequelize = new Sequelize(settings.database.database, settings.database.username, settings.database.password, settings.database.params);



router.post('/ejecutar', (req,res)=>{
	modelos.Alerta.findAll({include: [{model: modelos.Reporte}]}).then((alertas)=>{
		var ahora = new Date();
		var alertas_ejecutar = [];
		for(var x = 0; x<alertas.length; x++){
			diferencia = (ahora-alertas[x].get('ejecucion'));
			if(alertas[x].get('frecuencia')<diferencia){
				alertas_ejecutar.push(promesa(alertas[x]));
			}
		}
		if(alertas_ejecutar.length==0){
			res.json({cod: 1, msj: 'No hay alertas'});
		}
		else{
			enviar_reporte = [];
			Promise.all(alertas_ejecutar).then((result)=>{
				res.json({cod: 1, msj: result});
			}).catch((error)=>{
				if(error.msj)
					error = error.msj;
				res.json({cod: 0, msj: "Error al ejecutar alertas. "+error});
			
			})
		}
	}).catch((error)=>{
		res.json({cod: 0, msj: error});
	});
});
module.exports = router;

function promesa(alerta){
	return new Promise((ok, faile)=>{
		query = alerta.get('Reporte').get('query');
		var a = alerta.get('valores');
		values = JSON.parse(a);
		for(value in values){
			valor = values[value];
			if(valor=='')
				valor = 'null';
			var expresion = new RegExp('{'+value+'}','g');
			query = query.replace(expresion, values[value]);
		}
		sequelize.query(query).spread(function(result,metadata){
			if(result.length>0){
				info = {encabezados: [], data: []};
				info.encabezados = Object.keys(result[0]);
				for(var x = 0; x<result.length;x++){
					info.data[x] = {linea: []};
					Object.keys(result[x]).reduce((a,key)=>{
						info.data[x].linea.push(result[x][key]);
					},0);
				}
				Impresion.imprimir(alerta.get('FormatoId'), info, 'html').then((html)=>{
					modelos.AlertaUsuario.findAll({where: {AlertumId: alerta.get('id')}}).then((alertar)=>{
						out = "";
						for(var j = 0; j<alertar.length;j++){
							//out += "ejecutivo: "+alertar[j].get('EjecutivoId')+", msj: "+JSON.stringify(result)+'...';
							var info = {notification: {'title': 'Reporte de '+alerta.get('titulo'), 'html': html}, data: {'reporte': alerta.get('id')}};
							//console.log(info);
							FCM.enviar_info(alertar[j].get('EjecutivoId'), info);
						}	
						return {cod: 1, msj: 'Ok'}
					}).then((out)=>{
						var ahora = new Date();
						alerta.update({ejecucion: ahora}).then((result)=>{
							ok(out);
						}).catch((error)=>{
							faile({cod: 0, msj: error.message});
						});
					}).catch((error)=>{
						faile({cod: 0, msj: error.message});
					});	
				}).catch((error)=>{
					fail({cod: 0, msj: "Error al enviar a impresion"+error});
				});
					
			}else{
				ok({cod: 1, msj: 'No hay registros en alerta'});
			}
		}).catch(function(error){
			faile({cod: '0', msj: error.message});
		});	
	});
}