module.exports = function(sequelize, DataTypes){
	var Alerta = sequelize.define('Alerta', {
		id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, pintar: [2,3,4], name: 'Identificador', tipo: 'number'},
		titulo: {type: DataTypes.STRING, pintar:[1,2,3,4], allowNull: false, name:'Titulo', tipo: 'text', unique: true},
		ejecucion: {type: DataTypes.DATE, allowNull: false, pintar: [1,2,3,4], name: "Fecha y hora ultima ejecucion", tipo: "date"},
		frecuencia: {type: DataTypes.INTEGER, allowNull: false, pintar: [1,2,3,4], name: "Frecuencia de ejecucion minutos", tipo: "number"},
		valores: {type: DataTypes.TEXT, allowNull: true, pintar: [1,2,3,4], name: "JSON con valores para reporte", tipo: 'textarea'}
	},{
		freezeTableName: true,
		paranoid: true,
		referencia: {representante: ['titulo']},
		classMethods: {associate: function(models){
			Alerta.belongsTo(models.Usuario, {as: 'Creador', allowNull: false}),
			Alerta.belongsTo(models.Formato),
			Alerta.belongsTo(models.Reporte, {allowNull: false})
		}},
		relaciones: {
			ReporteId: {pintar: [1,2,3,4], name: "Seleccione el reporte a ejecutar", tipo:"select"},
			FormatoId: {pintar: [1,2,3,4], name: 'Seleccione el formato para impresion', tipo: 'select'}
		},
		seguridad: {
			1: 'alertaIns', 2: 'alertaAct', 3: 'alertaEli', 4: 'alertaBus' 
		}
	});
	return Alerta;
}