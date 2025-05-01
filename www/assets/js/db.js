// JavaScript Document

class dataBase{
    constructor(ok){
       try{
           this.ddb;
           this.prueba = "";
           var acciones = this;
           
           // Mantener la pantalla encendida
           if (window.plugins && window.plugins.insomnia) {
               window.plugins.insomnia.keepAwake();
           }
           
           this.conecta(ok);
       }catch(err){
           alert(err);
       }
    }
    conecta(fn){
        
        var acciones = this;
        var db = null;
        let version;
        //alert(navigator.platform);
       
        
            
              db = window.sqlitePlugin.openDatabase({
                  name: base_datos,
                  location: 'default',
                  androidDatabaseProvider: 'system'
              });
        
        
        
       acciones.ddb = db;
        
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS ser_registro (id integer primary key autoincrement unique, registro TEXT, apertura TEXT,modificacion TEXT,remoto TEXT,imagenes TEXT,respuesta TEXT ,fecha TEXT,estado INTEGER,codigo TEXT,servicio INTEGER)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS ser_modelos (id integer primary key autoincrement unique, remoto TEXT, nombre TEXT)')   
            
            tx.executeSql('CREATE TABLE IF NOT EXISTS ser_activos (id integer primary key autoincrement unique, registro TEXT, apertura TEXT,modificacion TEXT,remoto TEXT,imagenes TEXT,respuesta TEXT,fecha TEXT,estado INTEGER,codigo TEXT,servicio INTEGER,cliente INTEGER)');
            
            
            tx.executeSql('CREATE TABLE IF NOT EXISTS ser_logs (id integer primary key autoincrement unique, accion TEXT, registro TEXT,fecha TEXT)');
          }, function(error) {
            alert('Transaction ERROR: ' + error.message);
          }, function() {
            fn();
        });
    }
    insert(sql,fn,error){
        let acciones = this;
		if(Array.isArray(sql.registro)){
			let sql_insert = [];
			let campos = [];
			let asq = [];
			let sq = [];
			acciones.ddb.transaction(function(tx) {
				for(let io in sql.registro){
					let valores = [];
					let registro = sql.registro[io];
					for(let ios in registro){
						if(io==0){ campos.push(ios); asq.push("?"); }
						valores.push((typeof registro[ios]==="undefined" ? "":registro[ios]));
					}
                    console.log('INSERT INTO '+sql.tabla+' ('+campos.join(',')+')  VALUES ('+asq.join(",")+')')
					tx.executeSql('INSERT INTO '+sql.tabla+' ('+campos.join(',')+')  VALUES ('+asq.join(",")+')',valores);
				}
				if(typeof fn ==="function") fn(true);
			});
		}else{
			acciones.ddb.transaction(function(tx) {
				let campos = [];
				let valores = [];
				let asq = [];

					console.log("es objeto");
					for(let io in sql.registro){ 
						campos.push(io);
						asq.push("?");
						valores.push((typeof sql.registro[io]==="undefined" ? "":sql.registro[io]));
					}

					tx.executeSql('INSERT INTO '+sql.tabla+' ('+campos.join(',')+') VALUES ('+asq.join(",")+')',valores,function(res){
						if(typeof fn ==="function")
						fn(res);
					},function(res){
						if(typeof error ==="function") error();
					});
			}),function(error){
			   alert(JSON.stringify(error));   
			},function(res){       
				console.log(res);
			};
        }
    }
    logs(accion,datos){
        this.insert({"tabla":"ser_logs","registro":{"accion":accion,"registro":JSON.stringify(datos),"fecha":new Date().getTime()}});
    }
    
    update(tabla,datos,where,fn){
        let acciones = this;
        let campos = [];
        let valores = [];
        for(let io in datos){
                campos.push(io+"='"+datos[io]+"'");
        }
        for(let io2 in where){
            valores.push(io2+"='"+where[io2]+"'");
        }
        acciones.ddb.transaction(function(tx){
            let sql = "UPDATE "+tabla.tabla+" set "+(campos.join(","))+" where "+(valores.join(","))+"";
            tx.executeSql(sql,[],function(_,E){ 
                console.log("Actualizado correctamente.");
            },function(tx2,error){
                console.log(error);
		  });
            
            
        },function(e){
            console.log("Error: ",e);
        },function(){
            console.log('SELECT * FROM '+tabla.tabla+(" where "+(valores.join(','))));
                        
                        
            acciones.ddb.transaction(function(tx){
                tx.executeSql('SELECT * FROM '+tabla.tabla+(" where "+(valores.join(','))), [], function(tx2,resp) {
                    let res = [];
                    for(var i= 0;i <= resp.rows.length-1;i++){
							res.push(resp.rows.item(i));                   
                    }  
                    
                    
                    if(typeof fn !=="undefined") fn(res);
                })
            });
        });
    }
    query(sql,funcion){ 
        let acciones = this;
		let where = "";
		
		if(typeof sql.where!=="undefined") where = " where "+sql.where;
		
        acciones.ddb.transaction(function(tx){
            tx.executeSql('SELECT * FROM '+sql.tabla+where, [], 
				function (tx2, results) {
                let res = [];
				console.log("resultado query",results)
                for(var i= 0;i <= results.rows.length-1;i++){
					if( /MacIntel/i.test(navigator.platform) ) {
                    	res.push(results.rows[i]);
					}else{
						res.push(results.rows.item(i));
					}
                }    
                    //console.log(res);
                if(typeof funcion ==="function") funcion(res);
                });
            
            
        }),function(){
            
        }
        
        /*window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        
        const tx    = this.ddb.transaction([sql.tabla],"readwrite");
        const store = tx.objectStore(sql.tabla);
        //console.log("AQUI",sql.campo)
        if(typeof sql.campo !=="undefined"){
            
            console.log("Busca: ",sql.busca,"en el campo",sql.campo);
            const index = store.index(sql.campo); 
            let recorrido = [];
            if(sql.campo!="id"){
              var singleKeyRange = window.IDBKeyRange.only(sql.busca);
              index.openCursor(singleKeyRange).onsuccess = function(e) {
                  let cursor = (e.target.result);
                  if(cursor){    
                      recorrido.push(cursor.value);
                      cursor.continue();    
                  }else{
                      if(funcion){
                        funcion(recorrido);
                      }
                  }
               };
            }else{
              index.openCursor().onsuccess = function(e) {
                  let cursor = (e.target.result);
                  if(cursor){  
                      if(cursor.value.id == sql.busca){
                        recorrido.push(cursor.value);
                      }
                      cursor.continue();    
                  }else{
                      if(funcion){
                        funcion(recorrido);
                      }
                  }
               };
            }
        }else{ 
            if(typeof sql.busca!=="undefined"){
                
                store.get(sql.busca).onsuccess = function(event){
                    funcion(event.target.result);
                }
            }else{
            store.getAll().onsuccess = function(event){
             funcion(event.target.result)   
            };
            }
        }
        */
        
    }
    delete(sql,funcion){
        console.log('Mando a eliminar',sql)
        if(typeof sql.tabla !=="undefined"){
			this.ddb.transaction(function(tx){
				tx.executeSql('DELETE FROM '+sql.tabla+((typeof sql.id!=="undefined")? ' where id="'+sql.id+'"':""),[],function(tx2,results){
					console.log(tx2,results);
					console.log("empieza a eliminar "+sql.tabla+" id:"+sql.id);

				});    
			});
		}
    }
    total(tabla,campo){
        //console.log("total"+tabla);
        this.ddb.transaction(function(tx){
            tx.executeSql('select count(id) as cuenta from '+tabla,[],function(tx2,results){
                //console.log(results.rows[0].cuenta);
                if( /MacIntel/i.test(navigator.platform) ) {
					$(campo).html(results.rows[0].cuenta);
				}else{
					$(campo).html(results.rows.item(0).cuenta);
				}
				
            });
            
        });
            
    
        
    }
}
