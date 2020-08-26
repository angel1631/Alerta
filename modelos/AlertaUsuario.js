module.exports = function(sequelize, DataTypes){
	var AlertaUsuario = sequelize.define('AlertaUsuario', {
		id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, pintar: [2,3,4], name: 'Identificador', tipo: 'number'}
	},{
		freezeTableName: true,
		paranoid: true,
		referencia: {representante: ['id', 'AlertumId.titulo', 'EjecutivoId']},
		classMethods: {associate: function(models){
			AlertaUsuario.belongsTo(models.Alerta, {allowNull: false}),
			AlertaUsuario.belongsTo(models.Usuario, {as: 'Ejecutivo', allowNull: false}),
			AlertaUsuario.belongsTo(models.Usuario, {as: 'Creador', allowNull: false})
		}},
		relaciones: {
			AlertumId: {pintar: [1,2,3,4], name: "Alerta", tipo: 'select'},
			EjecutivoId: {pintar:[1,2,3,4], name: "Ejecutivo al que se informara", tipo: 'select'}
		},
		seguridad: {
			1: 'alertaUsuarioIns', 2: 'alertaUsuarioAct', 3: 'alertaUsuarioEli', 4: 'alertaUsuarioBus' 
		},
		indexes: [{unique: true, fields: ['EjecutivoId', 'AlertumId', 'deletedAt']}]
	});
	return AlertaUsuario;
}