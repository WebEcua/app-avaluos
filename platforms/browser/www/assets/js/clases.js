class Sistema {
    constructor(formulario,url){
    console.log(window.localStorage);
      try{
        let acciones = this;
        this.errores = {};
        this.form_id    = formulario;
        this.webservice = url;
          
          setInterval(function(){
                
                acciones.onOnline(); 
          
            },30000);
        acciones.eventos();
        acciones.pueblaDBG();
        this.cam = new Camara('#interaccion','#camara');
        
        this.pestania_home = 0;
        this.pestania_cliente = 2
        this.pestania_activos = 3;
        this.pestania_formulario = 4;
        this.key = 'FbcCY2yCFBwVCUE9R+6kJ4fAL4BJxxjdRcqy5rHVLwU=';
        this.iv  = 'e16ce913a20dadb8';

        }catch(err){
            alert("ERROR--: "+err);
        }
        
    }
    async init(){
        var acciones = this; 
        try{
            // Inicializar base de datos con Promise
            this.base = await new Promise((resolve, reject) => {
                const db = new dataBase(function(){
                    resolve(db);
                });
            });

            // Ejecutar operaciones secuencialmente
            await acciones.obtieneDash();

            if(typeof window.localStorage.servicios !== 'undefined' && window.localStorage.cliente !== '') {
                await acciones.btnAgregarInventario();
            }

            if(typeof window.localStorage.getItem('cliente') === "string") {
                await acciones.pantallaCliente(window.localStorage.getItem('cliente'));
            }

            if(typeof window.localStorage.getItem('registros') === "string") {
                $('#Pendientes').html(window.localStorage.registros);
            }

            await acciones.botonOpciones("agregar_registro");

            if(typeof window.localStorage.getItem('proyecto') === "string") {
                await acciones.pantallaProyecto(window.localStorage.getItem('proyecto'));
            }

            await acciones.obtieneLogs();
            await acciones.botones();

        } catch(e) {
            console.error('Error en inicialización:', e);
            alert(JSON.stringify(e));
        }
    }
    modal(titulo,contenido){
        $('#modal-grande').addClass('is-active')
        $('.modal-card-head').html(titulo)
        $('.modal-card-body').html(contenido);
        $('.h-modal-close').unbind().on('click',function(){
            $('#modal-grande').removeClass('is-active')
        })
    }
    muevePantalla(n){
        var objetivo = n;
        var acciones = this;
        console.log(acciones.pestania_formulario);
        $tarjetas.carousel(parseInt(objetivo));
        $tarjetas.carousel('pause');
        $tarjetas.trigger({ type:"cambiaPagina",pagina: objetivo});
        if($('html').hasClass('layout-expanded')){
            
            $('html').removeClass('layout-expanded');
        }
        if(objetivo==0 || objetivo==acciones.pestania_formulario){
            $('#boton_opciones').addClass('d-none');
        }
    }
    asignarModelo(id,texto){
        $('.nombre-modelo').html(texto);
        $('.modelo-id').val(id).trigger('change');
        if(id=='otros'){
            $('.modelo_otro').removeClass('d-none')
        }else{
            $('.modelo_otro').addClass('d-none');
        }
        $('#modal-grande').removeClass('is-active')
    }
    buscarModelo(text,objetivo){
        var acciones = this;
        this.base.query({"tabla":'ser_modelos',"where":"nombre like '%"+text+"%'"},function(res){
            
            let lista = $(objetivo);
            var html = "";
            ///lista.html(html);
            var mz = [];
			
			html+="<div class='row item pb-1' onclick=\"interfaz.asignarModelo('otros','Otros')\">";
			    html+='<div class="col-8"><strong>Otros</strong></div>';
				html+='<div class="col-2"><a class="btn btn-primary"><i class="fa fa-search"></i></a></div>';
			html+='</div>';
			if(res.length > 0){ 	
				for(let ir in res){
				html+="<div class='row item pb-1' onclick=\"interfaz.asignarModelo('"+res[ir].remoto+"','"+res[ir].nombre+"')\">";
					html+='<div class="col"><strong>'+res[ir].nombre+'</strong></div>';
					html+='<div class="col-2"><a class="btn btn-primary"><i class="fa fa-search"></i></a></div>';
				html+='</div>';
				}
				
			}
			
			if(res.length == 0){
			//	html += "<div class='text-center'>No encontramos el modelo <strong>"+text+"</strong> en nuestra base , vuelva a intentarlo por favor</div>";				
			}
			
            
            lista.html(html);
        })

    }
    obtieneLogs(){
        let objetivo = $('#listadoLogs');
        var html = "";
        //"select * from ser_logs order by id desc limit 4"
        this.base.query({"tabla":"ser_logs","limit":4},function(res){
            
            for(var i in res){
                if(typeof res[i] ==="object"){
					let fecha = new Date(res[i].fecha*1);
                        let mes   = fecha.getMonth()+1;
                        mes = (mes<9? '0'+mes:mes);
                html+='<div class="card mb-1">';
                    html+='<div class="card-body">';
                        html+='<div class="row">';
                        html+='<div class="col-1 text-center"><i class="fa fa-sync opacity-25"></i>'+'</div>';
                        html+='<div class="col">'+res[i].accion+'</div>';
						html+='<div class="col small text-right opacity-25"><i class="fa fa-calendar"></i>  Fecha: <strong>'+(fecha.getFullYear()+"-"+mes+"-"+fecha.getDate())+'</strong></div>';
                        html+='</div>';
                        
                    
                    html+='</div>';
                html+='</div>';
                }
                
            }
            objetivo.html(html);
        });
    }
    Online(status){
        let objetivo = $('#estadoServicio');
        if(status){
            $('#estadoServicio i').addClass('fa-check-circle')
            objetivo.removeClass('bg-danger').addClass('bg-success');
        }else{ 
            $('#estadoServicio i').addClass('fa-ban').removeClass('fa-check-circle');
            objetivo.addClass('bg-danger').removeClass('bg-success');
            }  
        
    }
    abre(){
        $('.layout-container').removeClass('d-none');
		$('.layout-2').removeClass('d-none');
        $('#interaccion').removeClass('d-none');
        $('.authentication-1').addClass('d-none');
    }
    async consultaRegistro() {
        try {
            // Consultar registros usando Promise
            const registros = await new Promise((resolve, reject) => {
                this.base.query("select * from ser_registro", function(res) {
                    resolve(res);
                });
            });

            let html = "";
            for(let i in registros) {
                if(typeof registros[i] === "object") {
                    const registro = registros[i];
                    const nombre = JSON.parse(registro.registro);
                    
                    html += `<div class="p-1">     
                        <div class="card mb-1">
                            <div class="card-body" id="dRegistro_${registro.id}">
                                <div class="row">
                                    <div class="col-2 text-dark">${registro.id}</div>
                                    <div class="col text-dark">${nombre.descripcion}</div>
                                    <div class="col-2">
                                        <a class="btn btn-sm btn-danger" href="javascript:void(interfaz.eliminarRegistro(${registro.id}));"><i class="fa fa-trash"></i></a>
                                    </div>
                                </div>`;

                    if(registro.imagenes_local) {
                        html += '<div class="row mt-2">';
                        try {
                            // Obtener directorio de imágenes
                            const dirEntry = await new Promise((resolve, reject) => {
                                window.resolveLocalFileSystemURL(registro.imagenes_local, resolve, reject);
                            });

                            // Leer entradas del directorio
                            const entries = await new Promise((resolve, reject) => {
                                dirEntry.createReader().readEntries(resolve, reject);
                            });

                            // Procesar cada imagen
                            for(const entry of entries) {
                                if(entry.isFile) {
                                    html += `<div class="col-4">
                                        <img src="${entry.toURL()}" class="img-fluid" />
                                    </div>`;
                                }
                            }
                        } catch(err) {
                            console.error('Error al cargar imágenes:', err);
                        }
                        html += '</div>';
                    }

                    html += '</div></div></div>';
                }
            }

            if(!registros || registros.length === 0) {
                html = "No existen resultados para la consulta que esta realizando";
            }
            
            $('#historialRegistros').html(html);
        } catch(err) {
            console.error('Error en consulta de registros:', err);
            alert('Error al consultar registros');
        }
    }
    eliminarRegistro(id){
        let acciones = this
        if(confirm("Esta seguro que desea eliminar el registro")){
            acciones.base.delete({"tabla":'ser_registro',"id":id});
            $('#dRegistro_'+id).remove();
            acciones.obtieneDash();
        }
    }
    cambiaProyecto(id){
        let acciones = this;
        let listado = JSON.parse(window.localStorage.getItem('clientes'));
        for(let i in listado){
           
            if(listado[i].id == window.localStorage.getItem('cliente')){
                console.log(listado[i].proyectos)
                for(let p in listado[i].proyectos){
                    
                    if(listado[i].proyectos[p]._id == id){
                        console.log("iguales")
						$('#contenedor-servicios').removeClass('d-none')
                    	$('#selecCliente .proyecto').html(listado[i].proyectos[p].nombre);
						acciones.cierra("modal");
					}
                }
            }
        }
        window.localStorage.proyecto = id;
        acciones.botonOpciones('agregar_registro');
        
    }
    pantallaProyecto(id){
        let acciones = this;
        let listado = JSON.parse(window.localStorage.getItem('clientes'));
        for(let i in listado){
            if(listado[i].id == window.localStorage.getItem('cliente')){
                for(let p in listado[i].proyectos){
                    if(listado[i].proyectos[p].id == id)
                    $('#selecCliente .proyecto').html(listado[i].proyectos[p].nombre);
                    
                }
            }
        }
        
    }
    pantallaCliente(id){
        let acciones = this;
        let listado = JSON.parse(window.localStorage.getItem('clientes'));
        let cliente = [];
        let index = 0;
        for(let i in listado){
            if(listado[i].id==id) index = i;
            cliente[listado[i].id] = listado[i].nombre;
            
        }
        
        window.localStorage.proyectos = JSON.stringify(listado[index].proyectos);
        
        window.localStorage.setItem('cliente',id);
        $('#selecCliente .nombre').html(cliente[id]);
        $('#actividad').attr('data-cliente',id);
    }
    cambiaCliente(id){
        let acciones = this;
        let listado = JSON.parse(window.localStorage.getItem('clientes'));
        let cliente = [];
        let index = 0;
        for(let i in listado){
           console.log(listado[i].id,id);
            if(listado[i].id==id){
				$('#botonera').removeClass('d-none');
				index = i;
			
			}
            cliente[listado[i].id] = listado[i].nombre;
            
        }
        
        window.localStorage.proyectos = JSON.stringify(listado[index].proyectos);
        
        window.localStorage.setItem('cliente',id);
        $('#selecCliente .nombre').html(cliente[id]);
        acciones.muestraProyectos();
        $('#actividad').attr('data-cliente',id);
        //}
        
    }
    muestraProyectos(){
        let acciones = this
        var html = "";
        
        let clientes = window.localStorage.proyectos
            if( typeof clientes ==="undefined" || clientes ===""){
                alert("No existen clientes en su listado, debe sincronizar la aplicación");
            }else{
                let listado = JSON.parse(clientes);
                for(var i in listado){

                    html+='<div class="card bg-dark mt-3" onclick="interfaz.cambiaProyecto(\''+listado[i]._id+'\')"><div class="card-body">'+
                        '<div class="row">'+
                        //'<div class="col-4 text-center">'+
                        //'</div>'+
                        '<div class="col"><h5 class="mt-4 text-center text-white">'+listado[i].nombre+'</h5></div>'+
                        '</div>'+
                        '</div>'+
                        '</div>';


                }

                acciones.llamaModal("Listado de clientes",html);
            }
        //}
    }
    muestraClientes(){
        let acciones = this
        var html = "";
        let clientes = window.localStorage.clientes
        if( typeof clientes ==="undefined" || clientes ===""){
            alert("No existen clientes en su listado, debe sincronizar la aplicación");
        }else{
            let listado = JSON.parse(clientes);
            for(var i in listado){
                html+='<div class="card bg-dark mt-3" onclick="interfaz.cambiaCliente(\''+listado[i].id+'\','+i+')"><div class="card-body">'+
                    '<div class="row">'+
                    '<div class="col-4 text-center">'+
                        '<img class="d-none" src="'+(typeof listado[i].imagen ==="undefined"? "/assets/img/icono-imagen.png":'data:image/'+listado[i].imagen.formato+';base64,'+listado[i].imagen.archivo)+'" width="70%" />'+
                    '</div>'+
                    '<div class="col"><h5 class="mt-4">'+listado[i].nombre+'</h5></div>'+
                    '</div>'+
                    '</div>'+
                    '</div>';
                
                
            }
            
            acciones.llamaModal("Listado de clientes",html);
        }
    }
    eventos(){
        console.log("Eventos");
        var acciones = this;
        
        $('.onChangeFiltro').unbind().on("change",function(){
            let mz = [];
            var busca = $(this).val();
            var objetivo = $(this).attr('data-busca');
            if(busca=="0"){
               $('#listadoArticulos .item').removeClass('d-none');
               $('#listadoArticulos .item').each(function(res){
                    mz[$(this).attr('data-manzana')]="";   
               }) 
                
            }else{
            $('#listadoArticulos .item').each(function(res){
                if($(this).attr('data-'+objetivo)==busca){
                 
                        
                       
                        mz[$(this).attr('data-manzana')]="";
                    
                    $(this).removeClass('d-none');
                }else{
                    $(this).addClass('d-none');
                }
            });
                
            }
            acciones.filtroMz(mz);
        })
        $('.onChangeMz').unbind().on("change",function(){
            var busca = $('.onChangeFiltro').val();
            var actual = $(this);
            var objetivo = $(this).attr('data-busca');
            if(busca=="0"){
               $('#listadoArticulos .item').removeClass('d-none');
                if(actual.val()!=""){
               $('#listadoArticulos .item').each(function(res){
                    
                    if($(this).attr('data-manzana')==actual.val()){

                        $(this).removeClass('d-none');
                    }else{
                        $(this).addClass('d-none');
                    }
                });}
            }else{
            if(actual.val()==""){
               $('#listadoArticulos .item').each(function(res){
                    
                    if($(this).attr('data-ciudadela')==busca){

                        $(this).removeClass('d-none');
                    }else{
                        $(this).addClass('d-none');
                    }
                });
            }else{
                $('#listadoArticulos .item').each(function(res){
                    
                    if($(this).attr('data-ciudadela')==busca && $(this).attr('data-manzana')==actual.val()){

                        $(this).removeClass('d-none');
                    }else{
                        $(this).addClass('d-none');
                    }
                });
            }
                
            }
        })
        $('#eliminarAnterior').unbind().on("click",function(res){
            base.query("delete from ser_registro");
            acciones.obtieneDash();
            alert("eliminado");
            
        })
        $('#selecCliente').unbind().on("click",function(){
           acciones.muestraClientes(); 
        });
        $('.carousel-inner').unbind();
        $('.tarjeta').each(function(i,e){
            $(e).unbind().click(function(){
                var objetivo = $(e).attr('data-objetivo');
                
                $tarjetas.carousel(parseInt(objetivo));
                $tarjetas.carousel('pause');
                $tarjetas.trigger({ type:"cambiaPagina",pagina: objetivo});
                $('#botonHome').click();
            });
	    });
        $('.tarjeta2').each(function(i,e){
            $(e).unbind().click(function(){
                var objetivo = $(e).attr('data-objetivo');
                
                $tarjetas.carousel(parseInt(objetivo));
                $tarjetas.carousel('pause');
                $tarjetas.trigger({ type:"cambiaPagina",pagina: objetivo});
                //$('#botonHome').click();
            });
	   });
       $('#btnBuscarCodigo').unbind().on("click",function(){
          if(!$('.busqueda').hasClass('d-none')){
          var val = $('#buscarCodigo').val();
          let servicio = $('#actividad').attr('data-servicio');
          if(val==""){
           //alert("No debe dejar el campo vacio")  
          }else{
              if(servicio==1) acciones.buscarActivo(val);
              if(servicio==2) acciones.buscarCivil(val);
          }
          }
           $('.busqueda').toggleClass('d-none');
       });
        $('#buscarCodigo').on("change",function(){
           if($(this).val()==""){
                acciones.buscarActivo("");  
           } 
        });
       
        console.log("Fin eventos");
    }
	botones(){
	   let acciones = this;
	   $('.escanearCodigo').unbind().on("click",function(){
           let ob = $(this);
           ob.attr('data-objetivo','buscarCodigo');
           acciones.leerCodigo(this);
       });
	   $('#buscarCodigo').unbind().on("change",function(){
		   console.log("buscarCodigo");
		   acciones.buscarActivo($(this).val());
	   })
	}
    cierra(tipo){
		//alert(tipo);
		switch(tipo){
			case "sesion":
			$('#interaccion').addClass('d-none');
        	$('.authentication-1').removeClass('d-none');			
			break;
			case "modal":
			$('.fondo-negro').remove();
			break;
		}
        
    }
    buscarActivo(text){
        var acciones = this;
		
        this.base.query({"tabla":tabla_activos,"where":"codigo like '%"+text+"%'"},function(res){
			
            let lista = $('#listadoArticulos');
            var html = "";
            ///lista.html(html);
            var mz = [];
			if(res.length==1){ 
				
				html+='<div class="buscar p-5">'+
					'<div clas="text-center p-1">Existe un resultado para la búsqueda: '+text+'</div>'+		
					'<div clas="text-center"><br><br><a class="btn btn-danger btn-ver-registro text-white"><i class="fa fa-edit"></i> Editar</a></div>'+		
				'</div>';
				acciones.llamaModal("Resultados busqueda:",html);
				
				$('.btn-ver-registro').on("click",function(){
					acciones.pueblaRegistro(res[0]);
					acciones.cierra("modal");	
				})
				
				//		 
							 
			}
			
			if(res.length > 1){ 
				console.log(res);
				html+="<div class='resultado-busqueda'>";
				for(let ir in res){
				html+="<a class='row item' onclick=\"interfaz.verActivo('"+res[ir].id+"','"+res[ir].codigo+"')\">";
					html+='<div class="col"><strong>'+res[ir].codigo+'</strong></div>';
					html+='<div class="col-2"><i class="fa fa-search"></i></div>';
				html+='</a>';
				}
				html+='</div>';
				acciones.llamaModal("Resultados busqueda:",html);
				
			}
			
			if(res.length == 0){
				html += "<div class='text-center'>No encontramos el activo <strong>"+text+"</strong> en nuestra base , vuelva a intentarlo por favor</div>";
				html +='<div class="text-center"><br><br><a data-objetivo="buscarCodigo" class="btn btn-danger text-white escanearCodigo">Escanear</a></div>';
				acciones.llamaModal("Resultados busqueda:",html);
				acciones.botones();
			}
			
            /*for(var $ii in res){
                
                //if(res.rows[$ii].servicio==1) html+=acciones.formatoActivo(res.rows[$ii],"listado");
                //if(res.rows[$ii].servicio==2) html+=acciones.formatoCivil(res.rows[$ii],"listado");
            }*/
            
            //lista.html(html);
            //$('#listadoArticulos').html(html);
        })
    }
	verActivo(id,codigo){
		let acciones = this;
		this.base.query({"tabla":tabla_activos,"where":"id='"+id+"' and codigo='"+codigo+"'"},function(res){
			acciones.pueblaRegistro(res[0]);
			acciones.cierra("modal");
		})
	}
    buscarCivil(text){
        var acciones = this;
        
        acciones.base.query("select * from "+tabla_activos+" where registro like '%"+text+"%'",function(res){
            let lista = $('#listadoCivil');
            var html = "";
            lista.html(html);
            var mz = [];
            //console.log(res.rows);
            for(var $ii in res.rows){
                if(typeof res.rows[$ii].registro !=="undefined"){
                    console.log(typeof res.rows[$ii].registro)
                    let campos = JSON.parse(res.rows[$ii].registro);
                    mz[campos.manzana]="";
                }
                if(res.rows[$ii].servicio==2) html+=acciones.formatoCivil(res.rows[$ii],"listado");
            }
            acciones.filtroMz(mz);
            lista.html(html);
            //$('#listadoArticulos').html(html);
        })
    }
    usuario(){
        var ob = JSON.parse(window.localStorage.usuario);
        return ob;
    }
    leerCodigo(i){
        var objetivo = $(i).attr('data-objetivo');
        var acciones = this;
        
        /*cordova.plugins.barcodeScanner.scan(
          function (result) {
              alert("We got a barcode\n" +
                    "Result: " + result.text + "\n" +
                    "Format: " + result.format + "\n" +
                    "Cancelled: " + result.cancelled);
          },
          function (error) {
              alert("Scanning failed: " + error);
          }
       );*/
        
        
        cordova.plugins.barcodeScanner.scan(
          function (result) {
              //alert(objetivo);
              $('input[name="'+(objetivo)+'"]').val(result.text).trigger('change');
			  $('.codigoLeido').html(result.text);
              //acciones.buscarActivo(result.text);
              //alert("We got a barcode\n" +
              //      "Result: " + result.text + "\n" +
              //      "Format: " + result.format + "\n" +
              //      "Cancelled: " + result.cancelled);
          },
          function (error) {
              alert("Error al escanear: " + error);
          },
          {
              preferFrontCamera : false, // iOS and Android
              preferCancel : true, // Android
              preferPrompt: false, // Android
              showFlipCameraButton : false, // iOS and Android
              showTorchButton : true, // iOS and Android
              torchOn: false, // Android, launch with the torch switched on (if available)
              saveHistory: true, // Android, save scan history (default false)
              prompt : "Ponga el codigo de barras frente al recuadro", // Android
              resultDisplayDuration: 5, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
              //formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
              orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
              disableAnimations : true, // iOS
              disableSuccessBeep: false // iOS and Android
          }
       );
    }
    filtraCampo(info){
    
        var ca  =  $(info).attr('data-objetivo');
        var filtra = $(info).val();
        
        $("select[name='"+ca+"'] option").addClass('d-none');
        $("select[name='"+ca+"'] option[value='otros']").removeClass('d-none');
        $("select[name='"+ca+"'] option[data-padre='"+filtra+"']").removeClass('d-none');
        $("select[name='"+ca+"'] option[value='']").removeClass('d-none').prop('selected','selected').trigger('change');
    }
    filtraActivos(info){
        var ca  =  $(info).attr('data-objetivo');
        var filtra = $(info).val();
        $("select[name='"+ca+"'] option").addClass('d-none')
        $.each($("select[name='"+ca+"'] option"),function(n,el){
            var padres = $(el).attr('data-padre');
            var enc = false;
            if(typeof padres !=="undefined"){
                for(var lp in padres){
                    if(padres[lp]==filtra) enc = true;
                }    
                if(enc) $(el).removeClass('d-none');  
            }
        });
        
    }
    sincronizando(){
        $('#sincronizar').html('<i class="fa fa-spinner fa-spin"></i> Sincronizando').addClass('text-white btn-secondary').removeClass('btn-success');
        
    }
    sincronizado(){
        $('#sincronizar').html('<i class="fa fa-check"></i> <strong>ACTUALIZADO</strong>').addClass('btn-success').removeClass('btn-secondary');
        setTimeout(function(){
            $('#sincronizar').html('Sincronizar').removeClass('text-white btn-success').addClass('btn-secondary');
            
        },12000);
    }
    sincronizar(){
       
        var acciones = this;
        
        if(navigator.onLine){
            acciones.sincronizando();
        try{ 
            this.base.query({tabla:"ser_registro"},function(e){
			   //alert(e);
              
			  
               var registros = [];
				if(e.length>0){
					
                   for(var i=0 ; i<= e.length-1; i++){ 
					   
                       let img = [];
                       let imagenes = JSON.parse(e[i].imagenes);
					 
                       for(let im in imagenes){
                           img.push({name:imagenes[im].name,"value":(imagenes[im].valor!=""? "1":"")});
                       }
                       e[i].imagenes = (img);
                       registros.push(e[i]);
                   }
				}
               console.log("empieza sPost");
				
               acciones.sPost(JSON.stringify(registros));    
               

            });
           
        }catch(e){
            console.log(e);
            alert(JSON.stringify(e));
        }
        }else{
            acciones.base.logs("Sincronizar: Sin conexión",{"fecha": new Date().getTime()});
            notifica("Error","Para sincronizar con el servidor necesita tener una conexión a internet","warning");
        }
        this.obtieneLogs();
        
    }
    async sPost(e){
        var acciones = this;
        try{
            if(typeof window.localStorage.proyecto !=="undefined"){
                //PRIMERO DESCARGO LA INFORMACION
              await $.post(_DOMINIO_,{
                "acc":"sincronizar"
                ,"llave":window.localStorage.llave,
                "datos":e,
                "empresa":window.localStorage.cliente,
                "proyecto":window.localStorage.proyecto},async function(res){
                var ob = res;
                if(ob.estado=="Permitido"){
					console.log("INFO: PERMITIDO");
                    formulario = [];
                    window.localStorage.usuario = JSON.stringify(ob.usuario);
                    window.localStorage.llave = ob.usuario.llave;
                    acciones.abre();
                    acciones.configuracion(ob);
					acciones.btnAgregarInventario();
					
					console.log("INFO: cargando activos");
                    if(typeof res.registros.listado !=="undefined" &&  res.registros.listado!=null){
                        await acciones.base.delete({"tabla":tabla_activos},function(reg,msg){
                            console.log(reg,"eliminando")
                        });
                        console.log("INFO: cargando activos");

                        let sql_reg = [];
                        var cuenta = 0;
                        for (var il in res.registros.listado){
                            var listado = res.registros.listado[il];

							let datos_insert = {};
							datos_insert.registro = JSON.stringify(listado);
							datos_insert.remoto   = listado.id;
							datos_insert.estado   = listado.tipo;
							datos_insert.codigo   = listado.codigo_barras;
							datos_insert.servicio = listado.servicio;
							datos_insert.cliente  = listado.cliente;
                            //IMAGENES
                            let id_registro = listado.id;
                            let imagenes = listado.imagenes;
                            
                            // Crear directorio para las imágenes del registro
                            /*let dir_imagenes = `${cordova.file.dataDirectory}imagenes/${id_registro}/`;
                            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dirEntry) {
                                dirEntry.getDirectory('imagenes', { create: true }, function(imagenesDirEntry) {
                                    imagenesDirEntry.getDirectory(id_registro, { create: true }, function(registroDirEntry) {
                                        // Descargar cada imagen
                                        if(imagenes && imagenes.length > 0) {
                                            imagenes.forEach(function(imagen) {
                                                let fileTransfer = new FileTransfer();
                                                let filename = imagen.nombre || `imagen_${Date.now()}.jpg`;
                                                let uri = encodeURI(imagen.url);
                                                let fileURL = dir_imagenes + filename;
                                                
                                                fileTransfer.download(
                                                    uri,
                                                    fileURL,
                                                    function(entry) {
                                                        console.log("Imagen descargada: " + entry.toURL());
                                                    },
                                                    function(error) {
                                                        console.error("Error al descargar imagen: " + error.source);
                                                    }
                                                );
                                            });
                                        }
                                    });
                                });
                            });
                            
                            // Guardar rutas de imágenes en el registro
                            datos_insert.imagenes_local = dir_imagenes;
                            */
							sql_reg.push(datos_insert);
                            
							window.localStorage.registros = cuenta;
                            cuenta++;
                            
                        }
                        console.log("INFO: insertando activos");
						acciones.base.insert({"tabla":tabla_activos,"registro":sql_reg},function(id){
                            console.log("INFO: insertando activos: "+id);
                        	acciones.obtieneDash();        
                        });
                      }  
                        
                    acciones.obtieneDash();  
                    console.log("INFO: trabaja con los ingresados");   
                    for(var i in res.registros.ingresados){
                        if(res.registros.ingresados[i].estado=="success"){
                            console.log("INFO: trabaja con los ingresados: "+res.registros.ingresados[i].id);    
                            var nuevo = res.registros.ingresados[i].nuevo;
                            acciones.sincronizando();
                            await acciones.base.update({"tabla":"ser_registro"},{"remoto":nuevo},{"id":res.registros.ingresados[i].id},async function(up){
                                var resultado = await acciones.subirFoto(up[0]);
                            });

                        }else{
                            acciones.base.update({"tabla":"ser_registro"},{"respuesta":res.registros.ingresados[i].error},{"id":res.registros.ingresados[i].id});
                        }

                    }
                    
                    /* devuelve todos los registros que estan en la base de datos al momento */
                    


                    if(res.registros.editados!=null){

                    for(var i in res.registros.editados){
                       acciones.base.query({"tabla":"ser_registro","busca":res.registros.editados[i].id},async function(e){
                                    var resultado = await acciones.subirFoto(e[0]);     
                            });   
                    }
                    
                    /* devuelve todos los registros que estan en la base de datos al momento */
                    }
                    
                    
                    return true;
                    
                }else{
                    $('#mensaje').html("<div class='alert alert-danger'><i class='fa fa-exclamation-triangle'></i> "+ob.mensaje+"</div>");
                    acciones.cierraSesion();
                }
                return false;
        });
            }
        }catch(e){
            alert(e);
        }
    }
    subirParte(datos) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: _DOMINIO_,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: datos,
                type: "POST",
                dataType: "json",
                success: (response) => {
                    if (response.estado === "success") {
                        resolve(response);
                    } else {
                        reject(new Error("Error en la respuesta del servidor"));
                    }
                },
                error: (err) => {
                    reject(err);
                },
            });
        });
    }
    async subirFoto(archivo){
    var minimo = 60000;
    let acciones = this
    var result = true;
	let Camara = this.cam;
    const url = _DOMINIO_;
    var id = archivo.remoto;
    var io = JSON.parse(archivo.imagenes);
    for(var ki in io){
        acciones.sincronizando();
        var key = io[ki].name;
        if(io[ki].valor!=""){
    	console.log("leo imagen");
		let imagen = await Camara.leerFoto(io[ki].valor);	
		console.log(imagen);
		console.log("Esa es la imagen");
        if(imagen.length > minimo){
			console.log("Subiendo por partes");
            var total = imagen.length;
            var partes = Math.trunc(imagen.length/minimo);
            var aum = 0;
            var decimales = ((imagen.length/minimo)+"").split('\.');
            if(parseInt(decimales[1])>0){ 
                //aum=1; 
            }
            var envia = "";
            for(var au =0 ; au<=(partes+aum);au++){
                console.log("Subiendo parte "+au)
                var inicia = 0;
                if(au>partes){
                    envia = (imagen.substr(au*minimo)); 

                }else{
                    envia = (imagen.substr(au*minimo,minimo));
                }
               let parte =  await acciones.subirParte({
                    "imagen":envia
                    ,"id":id
                    ,"nombre":key
                    ,"acc":"subirFotoPartes",
                    "parte":au,
                    "cliente":window.localStorage.cliente
                    ,"total":partes+aum
                    ,"modelo":archivo.servicio
                });
               if(parte.estado!="success") result = false 
            };
        }else{
                let totalImagen = await subirParte({
                    "imagen":imagen,
                    "id":id,
                    nombre:key,
                    acc:"subirFoto",
                    cliente:window.localStorage.cliente,
                    modelo:archivo.modelo
                })
                if(totalImagen.estado!="success") result = false 
        
        }
        } //verificacion de si esta vacio
        
    } //partes imagenes
    try{
        if(result){  
        acciones.sincronizado();
        acciones.base.delete({"tabla":"ser_registro","id":archivo.id});
        acciones.obtieneDash();
        }
    }catch(e){

    }
    return true;
  }
    cargaDatos(){
        
        var html = "";
        
        if(typeof window.localStorage.getItem("servicios")==='string' && window.localStorage.servicios!=""){ 
            var servicios = JSON.parse(window.localStorage.servicios);
            this.servicios();
            for(var valor in servicios){
                console.log(servicios[valor])
                html+='<div class="row">'+
                        '<div class="btn btn-danger mb-2 col" onclick="interfaz.cargaServicio('+servicios[valor].id+')">'+servicios[valor].nombre+'</div>'+
                      '</div>';
            }
            $('#servicios').html(html);
           
        }
        $('#sincronizar').html('Sincronizar');
        var htmlClientes = "";
        
        if(typeof window.localStorage.clientes!=='undefined' && window.localStorage.clientes!=""){
            console.log("dentro de");
            var clientes = JSON.parse(window.localStorage.clientes);
            //console.log(clientes);
            for(var valor2 in clientes){
                htmlClientes += '<div class="row mb-1">'+
                                    '<a class="btn btn-primary col" onclick="interfaz.formulario('+clientes[valor2].id+')">'+clientes[valor2].nombre+'</div>';
                                '</div>';
            }
            
            
        }else{
            htmlClientes+='<div class="row"><div class="col text-white"><strong>No tiene clientes asignados</strong></div></div>';
        }
        $('#listadoClientes').html(htmlClientes);    
        //this.eventos();
    }
    cierraSesion(){
        this.cierra("sesion");
        window.localStorage.removeItem("usuario");
        window.localStorage.clear();
		$('.layout-container').addClass('d-none')
		$('.layout-2').addClass('d-none')
    }
    pueblaDBG(){
        //console.log("Puebla DBG");ag
        for(var i in window.localStorage){
            if(i.indexOf('dbg_') > -1){
                
                var json = JSON.parse(window.localStorage[i]);
                window[i.replace("dbg_","")] = [];
                $('.'+i).prepend('<option value="0">Todos</option>');
                //console.log(i.replace("dbg_",""));
                for(var io in json){
                    $('.'+i).append('<option value="'+json[io].valor+'">'+json[io].texto+'</option>');
                    window[i.replace("dbg_","")][json[io].valor] = json[io].texto;
                    //console.log(json[i].valor);
                }
                
                //
            }
            if(i.indexOf('db_') > -1){
                
                var json = JSON.parse(window.localStorage[i])[window.localStorage.cliente];
                window[i.replace("db_","")] = [];
                $('.'+i).prepend('<option value="0">Todos</option>');
                //console.log(i.replace("dbg_",""));
                for(var io in json){
                    //$('.'+i).append('<option value="'+json[io].valor+'">'+json[io].texto+'</option>');
                    window[i.replace("db_","")][json[io].valor] = json[io].texto;
                    //console.log(json[io].valor);
                    
                }
                
                //
            }
        }
        
        this.eventos();
        console.log("Termina Puebla DBG");
    }
    configuracion(ob){
        console.log("Configura y puebla las bases localStorage e indexeddb",ob);
        var funcion = this;
        var usuario = this.usuario();
        for(var i in ob.db){
           window.localStorage.setItem("db_"+i,JSON.stringify(ob.db[i]));
           let alma = {};

           for(var ord in ob.db[i][window.localStorage.cliente]){
           
               alma[ob.db[i][window.localStorage.cliente][ord].valor] = ob.db[i][window.localStorage.cliente][ord].texto;
               //console.log(ob.db[i][window.localStorage.cliente][ord]);
           }
            window[i] = alma;
           //window.localStorage.setItem(i,JSON.stringify(alma));
           //console.log(ob.db[i],i);
        }
        for(var i in ob.dbg){
           window.localStorage.setItem("dbg_"+i,JSON.stringify(ob.dbg[i]));
           if(i == "ciudadela"){
               window[i] =[];
           let ino = ob.dbg[i];
               for(var io in ino){
                
                window[i][ino[io].valor] = ino[io].texto;
               }
           }
           if(i=='activoModelos'){
                let mod_ = ob.dbg[i];
                funcion.llamaModalVertical('Registrando base de datos','Se esta guardando los parametros del formulario, espere un momento por favor.')
                //$('#progressBarActivos').html('<div class="progress"><div class="progress-bar" role="progressbar" data-base="'+tabla_registros+'" style="width: 0%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">0%</div></div>')
                const tot = mod_.length;
                let aumenta = 0
                let sql_reg = [];
                for(let io in mod_){
                
                    let datos_insert = {};
                    
                    datos_insert.remoto   = mod_[io].valor;
                    datos_insert.nombre   = mod_[io].texto;
                    
                    //IMAGENES


                    //IMAGENES
                    sql_reg.push(datos_insert);
                
                }
                funcion.base.insert({"tabla":'ser_modelos','registro':sql_reg},function(id){
                    funcion.cierraModalVertical();
                });
           // 
           }
            //console.log(ob.db[i],i);
        }

        window.localStorage.servicios= JSON.stringify(ob.servicios);
        window.localStorage.clientes = JSON.stringify(ob.empresas);
        funcion.cargaDatos();
        
        
    }
    cargaServicio(id){
        $('#actividad').attr('data-servicio',id);
        this.formulario(window.localStorage.cliente);
        $('#boton_opciones').html('<i class="fa fa-plus"></i>');
    }
    buscarYSeleccionar(valorBuscado,campo) {
        
        //alert(valorBuscado)
        console.log("buscando",valorBuscado)
        if(valorBuscado=="otros")
        {

            $('.select2[name="'+campo+'"]').val(valorBuscado).trigger('change')
            $('.select2[name="'+campo+'"] option[value="'+valorBuscado+'"').val(valorBuscado).trigger('change')

        }else{
        // Buscar el objeto con el texto proporcionado
        for(let vb_ of dataModelos){
            if(vb_.id==valorBuscado) console.log("lo encontre")
        }
        const resultado = dataModelos.find(item => item.id === valorBuscado);
        if (resultado) {
            // Si se encuentra, seleccionar el valor correspondiente al id
            const nuevaOpcion = new Option(resultado.text, resultado.id, true, true);
            $('.select2[name="'+campo+'"]').append(nuevaOpcion).trigger('change');
        } else {
            // Si no se encuentra, mostrar un mensaje (puedes agregar lógica adicional aquí)
            console.log('El valor buscado no se encuentra en los datos.');
        }
    }
    }
    pueblaRegistro(d){
        let acciones = this;
		
        window.localStorage.apertura_formulario = new Date().getTime(); // obtengo la fecha de apertura del formulario
        //acciones.base.query({"tabla":tabla_activos,"campo":"id","busca":id},function(res){
            
            var registro = d;
            var campos = JSON.parse(registro.registro);
            let editando = {"id":registro.id,"tipo":registro.estado};
            window.localStorage.editando=JSON.stringify(editando);
            $(acciones.form_id+' input').unbind().removeClass('border-success');
            $(acciones.form_id+' textarea').unbind().removeClass('border-success');
		    
			acciones.formulario(window.localStorage.cliente,1);
		
		    
		
            for(var $ii in campos){   
                try{
                switch($ii){
                    /*case "codigo_barras":
                    break;
                    case "codigo_barras_anterior":
                    break;*/
					case "oficina":
					$(acciones.form_id+' [name="ubicacion"] option[data-oficina="'+campos[$ii]+'"][data-area="'+campos["area"]+'"][data-piso="'+campos["piso"]+'"]').prop('selected','selected').trigger('change');	
					break;
                    case "imagen":
                    break;
                    case "activo_padre":
                    break;
                    case "modelo":
                        console.log(campos[$ii]);
                        acciones.buscarYSeleccionar(campos[$ii],$ii);
                    break;
                    case "coordenadas":
                       if(campos[$ii]!=""){
                       let coordenadas = JSON.parse(campos[$ii]);
                        console.log(coordenadas);
                        for(var coor in coordenadas){
                            console.log('[name="'+$ii+'['+coor+']"]',coordenadas[coor]);
                            if($(acciones.form_id+' [name="'+$ii+'['+coor+']"]').length>0){
                                
                            }else{
                                acciones.duplicarCampo('.coordenada-original')
                            }
                            $(acciones.form_id+' [name="'+$ii+'['+coor+']"]').val(JSON.stringify(coordenadas[coor])).attr('data-original',coordenadas[coor]);        
                        }
                       }else{
                           $('.coordenada').each(function(n,el){
                               $(el).find('input').val('')
                               if(!$(el).hasClass('coordenada-original')) $(el).remove();
                           })
                       }
                    break;
                    case "originales":
                        let originales = campos[$ii];
						if(originales.length>0){
							for(var o in originales){
									switch(originales[o].id){
										case "geo1":
											$('[name="piso"]').parent().append('<div class="tag is-primary mt-1"><b>DATO ORIGINAL: </b>'+originales[o].valor+'</div>');
										break;
										
										case "material":
											$('[name="componente"]').parent().append('<div class="tag is-primary mt-1"><b>DATO ORIGINAL: </b>'+originales[o].valor+'</div>');
										break;
										case "marca":
											
											$('[name="activo_marca"]').parent().append('<div class="tag is-primary mt-1"><b>DATO ORIGINAL: </b>'+originales[o].valor+'</div>');
										break;
										case "modelo":
											$('[name="activo_modelo"]').parent().append('<div class="tag is-primary mt-1"><b>DATO ORIGINAL: </b>'+originales[o].valor+'</div>');
										break;
										default:
											$('[name="'+originales[o].id+'"]').parent().append('<div class="tag is-primary mt-1"><b>DATO ORIGINAL: </b>'+originales[o].valor+'</div>');
										break;
									}		
									switch(originales[o].campo.toLowerCase()){
										case "grupo":
											$('[name="agrupados"]').parent().append('<div class="tag is-primary mt-1"><b>DATO Grupo: </b>'+originales[o].valor+'</div>');
										break;
										case "subgrupo":
											$('[name="agrupados"]').parent().append('<div class="tag is-primary mt-1"><b>DATO Subgrupo: </b>'+originales[o].valor+'</div>');
										break;
										case "descripcion":
											$('[name="agrupados"]').parent().append('<div class="tag is-primary mt-1"><b>DATO Subgrupo: </b>'+originales[o].valor+'</div>');
										break;
									}
							}
						}
                    break
                    default:
                        
                    
                
                        if($(acciones.form_id+' [name="'+$ii+'"]').attr('type')=="checkbox"){
                            if(campos[$ii]==1) $(acciones.form_id+' [name="'+$ii+'"]').prop("checked","checked"); else $(acciones.form_id+' [name="'+$ii+'"]').prop("checked","");
                           
                        }else{
                            $(acciones.form_id+' [name="'+$ii+'"]').val(campos[$ii]).trigger('change');
                        }
                        //console.log($ii,campos[$ii]);
                    break;
                }

                }catch(e){
                    console.log("Error con el campo",e)
                }
            }
            console.log("Poblado")
            $(acciones.form_id+' input').on("change",function(){
                $(this).addClass('border-success');
            })
            console.log("Moviendo")
            acciones.muevePantalla(acciones.pestania_formulario);
            acciones.botonOpciones('editar_activo');
        //});
        
    }
    duplicarCampo(campo){
        var elemento = $(campo)
        $(campo).clone().insertAfter(campo);
        var cuenta = $('.coordenada').length-1;
        $(campo+":last input").prop('name','coordenadas['+cuenta+']');
        $(campo+":last a").attr('data-objetivo','coordenadas['+cuenta+']');
        $(campo+":last").removeClass(campo.replace('.',''));
    }
    buscaMarca(id){
        let marca = JSON.parse(window.localStorage.getItem("dbg_activoMarcas"));
        
        for(var $ii in marca){
            if(marca[$ii].valor==id) return marca[$ii].texto;
        }
    }
    buscaObjeto(id,tipo){
        switch(tipo){
            case "id":
                let objeto = JSON.parse(window.localStorage.getItem("dbg_activoObjeto"));
                for(var $ii in objeto){
                    if(objeto[$ii].valor==id) return (typeof objeto[$ii].texto ==="undefined" ? "": objeto[$ii].texto);
                }
                return "";
                
            break;
        }
    }
    formatoActivo(info,t){
        var html = "";
        var acciones = this;
        switch(t){
            case "listado":
                
                if(typeof info ==="object"){
                    html+='<div class="card mb-1 bg-dark" onClick="interfaz.pueblaRegistro('+info.id+')">';
                        let campos = JSON.parse(info.registro);
                        html+='<div class="container py-2">';
                        html+='<div class="row">';
                            html+='<div class="col">';
                                html+='<i class="fa fa-barcode"></i> '+info.codigo;
                                html+='<div>';
                                if(campos.objeto!="") html+='<i class="fa fa-sliders-h"></i> '+acciones.buscaObjeto(campos.objeto,"id")+'';
                                if(campos.activo_marca!=""){
                                    html+=' <span class="badge badge-primary">'+acciones.buscaMarca(campos.activo_marca)+'</span>';
                                }
                                html+='</div>';
                            html+='</div>';
                            //html+='<div class="col-2">';
                            //    html+='<a class="btn btn-sm btn-secondary" onClick="interfaz.pueblaRegistro('+info.id+')"><i class="fa fa-edit"></i></a>';
                           //html+='</div>';
                        html+='</div>';
                        html+='</div>' //p-1
                    html+='</div>'; // card
                 }else{
                     console.log(info);
                 }
            break;
        }
        return html;
    }
    formatoCivil(info,t){
        
        var html = "";
        var acciones = this;
        
        switch(t){
            case "listado":
                
                if(typeof info ==="object"){
                    let campos = JSON.parse(info.registro);
                    
                    html+='<div class="card mb-1 bg-dark item" data-id="'+info.id+'" onClick="interfaz.pueblaRegistro('+info.id+')" data-ciudadela="'+campos.ciudadela+'" data-manzana="'+campos.manzana+'">';
                        
                        html+='<div class="container py-2">';
                        html+='<div class="row">';
                            html+='<div class="col-12">';
                                html+='<i class="fa fa-barcode"></i> '+campos.direccion;
                                html+='<div>';
                                if(campos.objeto!="") html+='<i class="fa fa-sliders-h"></i> '+'';
                                
                                    html+=' <span class="badge badge-primary">'+window['ciudadela'][campos.ciudadela]+'</span>';
                                
                                html+='</div>';
                            html+='</div>';
                            html+='<div class="col">Mz: '+campos.manzana+'</div>';
                            html+='<div class="col">S: '+campos.solar+'</div>';
                            //html+='<div class="col-2">';
                            //    html+='<a class="btn btn-sm btn-secondary" onClick="interfaz.pueblaRegistro('+info.id+')"><i class="fa fa-edit"></i></a>';
                           //html+='</div>';
                        html+='</div>';
                        html+='</div>' //p-1
                    html+='</div>'; // card
                 }else{
                     console.log(info);
                 }
            break;
        }
        return html;
    }
    obtieneDash(){
        
        this.base.total('ser_registro','#Guardados');
        this.base.total('ser_activos','#Pendientes');
        
    }
    pueblaRegistros(cliente){
        if(typeof cliente ==="undefined") this.muestraClientes()
        let acciones = this;
        const servicio = $('#actividad').attr('data-servicio');
        //"select id,registro,codigo,remoto from "+tabla_activos+' where cliente="'+cliente+'" and servicio="'+servicio+'"'
        this.base.query({tabla:tabla_activos,"campo":"cliente","busca":cliente},function(res){
            
            $('.listado').addClass('d-none');
            let lista = $('#listadoArticulos');
            if(servicio==1){
                $('.ba').removeClass('d-none');
                $('.bc').addClass('d-none');
            }else{
                $('.ba').addClass('d-none');
                $('.bc').removeClass('d-none');
            }
            var mz = [];
            let html = "";
            
            if(res){
            for(var $ii in res){
                if(typeof res[$ii].registro !=="undefined"){
                    //console.log(res[$ii].registro)
                    let campos = JSON.parse(res[$ii].registro);
                    mz[campos.manzana]="";
                }
                //
                if(servicio==1) html+= acciones.formatoActivo(res[$ii],"listado");
                if(servicio==2) html+= acciones.formatoCivil(res[$ii],"listado");
            }
            acciones.filtroMz(mz);
            lista.html(html).removeClass('d-none');
            }     
        });
        
        
    }
    filtroMz(mz){
        /*$('#dbg_mz').val(null).trigger('change');*/
        $('.dbg_mz option').remove();
        $('.dbg_mz').append('<option value="">Todos</option>');
            for(var im in mz){
                if(typeof im !=="undefined" && im !="undefined"){
                let data = {
                    "text": im,
                    "id": im
                }
                $('.dbg_mz').append('<option value="'+im+'">'+im+'</option>');
                }
                //let newOption = new Option(data.text,data.id,false,false);
                //$('#dbg_mz').append(newOption).trigger('change');            
            }
    }
    formulario(cliente,servicio){
        //alert(cliente);
        var acciones = this;
        var form_id = this.form_id;
        var webservice = this.webservice;
        acciones.errores.nodetectado ={};
        var id_elemento= 0;
       
        var servicio = (typeof servicio !=="undefined" ? servicio: $('#actividad').attr('data-servicio'));
       
        var html = "";
        $(form_id).html('<i class="fa fa-spin fa-spinner"></i> cargando el formulario');
        var grupo = [];
        var grupos = formulario[servicio].grupos;
        //console.log("AQUI")
        //acciones.pueblaRegistros(cliente);
        
        var form = formulario[servicio].campos;
        let camposOrdenados = Object.keys(form).sort((a, b) => {
            // Si existe la propiedad orden, usarla para ordenar
            if (form[a].orden !== undefined && form[b].orden !== undefined) {
                return form[a].orden - form[b].orden;
            }
            // Si no existe orden, mantener el orden del índice
            return parseInt(a) - parseInt(b);
        });

            for(var i of camposOrdenados){
               
                if(form[i]){

                    if(typeof grupo[form[i].grupo]==="undefined") grupo[form[i].grupo]="";
                    grupo[form[i].grupo]+='<div class="row mb-1 mt-1">';
                    grupo[form[i].grupo]+='<div class="col-12 '+(form[i].clase_padre)+'">';
                    switch(form[i].tipo){
                        case "text":
                            grupo[form[i].grupo]+='<div class="text-muted"><strong>'+form[i].label+'</strong></div>';
                            grupo[form[i].grupo]+='<input type="text" name="'+form[i].nombre+'" class="form-control '+form[i].clase+'" placeholder="'+form[i].placeholder+'" />'+
                            '<div class="small text-muted mt-1">'+form[i].texto+'</div>';
                        break;
                        case "group-text":
                            //grupo[form[i].grupo]+='<div class="text-muted bg-secondary text-dark"><strong>'+form[i].label+'</strong></div>';
                            grupo[form[i].grupo]+='<div class="row no-gutters">';
                            var gtext = JSON.parse(form[i].valor);
                            for(var io in gtext){
                                if(typeof gtext[io].visualiza ==="undefined" || gtext[io].visualiza==0){
                                grupo[form[i].grupo]+='<div class="col pr-1">'+
                                    '<div class="">'+gtext[io].label+'</div>'+
                                    '<input type="text" name="'+gtext[io].nombre+'" class="form-control '+gtext[io].clase+' " placeholder="'+gtext[io].placeholder+'" />'+  
                                '</div>';
                                }
                            }
                            grupo[form[i].grupo]+='</div>';
                            //grupo[form[i].grupo]+='<input type="text" name="'+form[i].nombre+'" class="form-control '+form[i].clase+' bg-dark text-white" placeholder="'+form[i].placeholder+'" />'+
                            '<div class="small text-muted mt-1">'+form[i].texto+'</div>';
                        break;
                        case "checkbox-grupo":
                           grupo[form[i].grupo]+='<div class="row no-gutters">';
                           
                            let cbtext = JSON.parse(form[i].valor);
                            let divisor = 6;
                            for(var ou in cbtext){
                            grupo[form[i].grupo]+='<div class="col-'+(cbtext.length==1? 12:divisor)+' col-md-4 col-sm-12 pr-1 mt-2">'+
                                '<label class="switcher switcher-lg">'+
                                '<input type="checkbox" '+
                                (typeof cbtext[ou].funcion !=="undefined"? 'onchange="'+cbtext[ou].funcion+'(\''+cbtext[ou].objetivo+'\',this)" ':'')+
                                
                                'name="'+cbtext[ou].name+'" '+
                                'class="switcher-input '+(typeof cbtext[ou].clase ==="undefined" ? "" : cbtext[ou].label)+'" '+
                                'value="'+(typeof cbtext[ou].valor ==="undefined" ? "0" : cbtext[ou].valor)+'" />'+
                                
                                
                                
                                '<span class="switcher-indicator">'+
                                  '<span class="switcher-yes">'+
                                    '<span class="ion ion-md-checkmark"></span>'+
                                  '</span>'+
                                  '<span class="switcher-no">'+
                                    '<span class="ion ion-md-close"></span>'+
                                  '</span>'+
                                '</span>'+
                                '<span class="switcher-label ">'+cbtext[ou].label+'</span>'+
                                '</label>'+
                                '</div>';
                                
                    
                            }
                            
                           grupo[form[i].grupo]+='</div>';
                        break;
                        case "input-btn":
                            //grupo[form[i].grupo]+='<div class="text-muted bg-secondary text-dark"><strong>'+form[i].label+'</strong></div>';
                            
                            grupo[form[i].grupo]+='<div class="row no-gutters">';
                            
                            var gtext = JSON.parse(form[i].valor);
                            
                                grupo[form[i].grupo]+='<div class="col-12 col-sm-12 col-md-12 pr-1">'+
                                '<div class="">'+form[i].label+'</div>'+  
                                    '<div class="row no-gutters">'+
                                        '<div class="col pr-1">'+
                                        '<input type="text" name="'+gtext[0].nombre+'" class="form-control '+gtext[0].clase+'" placeholder="'+gtext[0].placeholder+'" />'+
                                        '</div>'+
                                        '<div class="col-2"><a class="btn btn-secondary" onclick="'+gtext[1].funcion+'"  data-objetivo="'+gtext[0].nombre+'"><i class="'+gtext[1].icono+'"></i></a></div>'+
                                    '</div>'+
                                    
                                '</div>';
                            
                            grupo[form[i].grupo]+='</div>'+
                            
                            '<div class="small text-muted mt-1">'+form[i].texto+'</div>';
                        break;
                        case "input-select":
                            //grupo[form[i].grupo]+='<div class="text-muted bg-secondary text-dark"><strong>'+form[i].label+'</strong></div>';
                            
                            grupo[form[i].grupo]+='<div class="row no-gutters">';
                            console.log("form",form[i]);
                            var gtext = JSON.parse(form[i].valor);
                            
                                grupo[form[i].grupo]+='<div class="col pr-1">'+
                                '<div class="">'+form[i].label+'</div>'+  
                                    '<div class="row">'+
                                        '<div class="col">'+
                                        '<input type="text" name="'+gtext[0].nombre+'" class="form-control '+gtext[0].clase+' bg-dark text-white" placeholder="'+gtext[0].placeholder+'" />'+
                                        '</div>'+
                                        '<div class="col-5">'+
                                        '<select name="'+gtext[1].nombre+'" class="form-control">'
                            
                                            var option = JSON.parse(window.localStorage.getItem("dbg_"+gtext[1].dbg));
                                           
                                            grupo[form[i].grupo]+="<option value=''></option>"
                                            for(var o in option){
                    
                                                grupo[form[i].grupo]+="<option value='"+option[o].valor+"' ";
                                                for(var u in option[o]){
                                                    switch(u){
                                                        case "valor":
                                                        break;
                                                        case "texto":
                                                        break;
                                                        default:
                                                            grupo[form[i].grupo]+= "data-"+u+"='"+option[o][u]+"' ";
                                                        break;
                                                    }
                                                }

                                                grupo[form[i].grupo]+=">"+option[o].texto+"</option>";
                                            }
                                            grupo[form[i].grupo]+=""; 
                 grupo[form[i].grupo]+= '</select>'+
                                        '</div>'+
                                    '</div>'+
                                    
                                '</div>';
                            
                            grupo[form[i].grupo]+='</div>'+
                            
                            '<div class="small text-muted mt-1">'+form[i].texto+'</div>';
                        break;
                        case "label":
                            grupo[form[i].grupo]+="<h4>"+form[i].label+"</h4>";
                            grupo[form[i].grupo]+='<div class="small text-muted">'+form[i].texto+'</div>';
                        break;
                        case "hidden":
                            //grupo[form[i].grupo]+="<h4>"+form[i].label+"</h4>";
                            grupo[form[i].grupo]+='<input type="hidden" name="'+form[i].nombre+'" value="'+form[i].valor+'" class="'+form[i].clase+'" />';
                        break;
                        case "html":
                            grupo[form[i].grupo]+='<div class="">'+form[i].valor+'</div>';   
                        break;
                        case "function":
                           grupo[form[i].grupo]+='<script>'+form[i].valor+'</script>';    
                        break;
                        case "textarea":
                            grupo[form[i].grupo]+='<div class="text-muted">'+form[i].label+'</div>';
                            grupo[form[i].grupo]+='<div><textarea name="'+form[i].nombre+'" class="form-control" rows="12"></textarea></div>';
                            grupo[form[i].grupo]+='<div class="small text-muted mt-1">'+form[i].texto+'</div>';
                        break;
                        case "imagen":
                            grupo[form[i].grupo]+='<div class="text-muted">'+form[i].label+"</div>";
                            grupo[form[i].grupo]+='<div class="row contenedor-imagen">';
                            
                                var option = JSON.parse(form[i].valor);
                                for(var ou in option){
                                    grupo[form[i].grupo]+="<div class='col-6 px-1 pb-1 imagen "+(typeof option[ou].clase==="undefined"? "":option[ou].clase)+"' >"+
                                    "<div class='card'>"+    
                                        "<img src='assets/img/icono-imagen.png' id='"+option[ou].nombre+"' class='img-fluid abreFoto' />"+
                                        "<input type='hidden' id='"+option[ou].nombre+"_imagen' name='imagen' data-name='"+option[ou].nombre+"' class=\""+(typeof option[ou].clase==="undefined"? "":option[ou].clase)+"\" value=\"\" />"+
                                        "<div class='p-1'>"+
                                        "<div class='small text-center text-dark'><strong>"+option[ou].label+"</strong></div>"+
                                        '<div class="row">'+
                                        '<div class="col pr-1"><a class="btn btn-secondary col mb-1 btn-sm tomarFoto" data-id="'+option[ou].nombre+'"><i class="fa fa-camera fa-2x"></i></a></div>'+
                                        '<div class="col pl-1"><a class="btn btn-primary col btn-sm galeriaFoto" data-id="'+option[ou].nombre+'"><i class="fa fa-images fa-2x"></i></a></div>'+
                                        '</div>'+
                                        
                                        "</div>"+
                                    "</div>"+  
                                    "</div>";
                                    
                                }
                            grupo[form[i].grupo]+='</div>';
                        break;
                        case "select":
                            grupo[form[i].grupo]+='<div class="text-muted">'+form[i].label+"</div>";
                            
                            if(form[i].valor!=""){
                                var option = {};
                                    option = JSON.parse(form[i].valor);

                                grupo[form[i].grupo]+="<select class='form-control select2 text-white "+form[i].clase+"' name='"+form[i].nombre+"' data-objetivo='"+(typeof option.objetivo!=="undefined" ? option.objetivo:"")+"' "+
                                    "onChange='"+(typeof option.onChange ==="undefined"? "":option.onChange)+"'"+
                                    (typeof option.otros!=="undefined" ? "data-otros='1' data-objetivo-otros='"+option.otros_objetivo+"'":"")+

                                    ">";
                                grupo[form[i].grupo]+='<option value=""></option>';
                                if(typeof option.otros!=="undefined"){
                                    if(option.otros==1){
                                        grupo[form[i].grupo]+='<option value="otros" data-funcionalidad="otros" data-objetivo-otros="'+option.otros_objetivo+'">Otros</option>';
                                    }
                                }   
                                    var tabla = "";
                                    if(typeof option.db !=="undefined"){


                                       if(window.localStorage.getItem("db_"+option.db)){
                                       tabla = option.db;
                                       var db_local = JSON.parse(window.localStorage.getItem("db_"+option.db));

                                       option = (db_local[cliente]);


                                       }
                                    }

                                    if(typeof option ==="undefined"){ 
                                        notifica("Error","Faltan parametros "+tabla+" por llenar")
                                        return false;
                                    }

                                    if(typeof option.dbg !=="undefined"){

                                       if(window.localStorage.getItem("dbg_"+option.dbg)){

                                       var db_local = JSON.parse(window.localStorage.getItem("dbg_"+option.dbg));
                                       option = (db_local);

                                       }
                                    }
                                       if(!form[i].clase.includes('select2-base')){ 

                                        for(var o in option){
                                            if(typeof option[o].cliente ==="undefined" || (typeof option[o].cliente !=="undefined" && (option[o].cliente==0 || option[o].cliente==window.localStorage.cliente))){
                                            
                                            grupo[form[i].grupo]+="<option value='"+option[o].valor+"' ";
                                            for(var u in option[o]){
                                                switch(u){
                                                    case "valor":
                                                    break;
                                                    case "texto":
                                                    break;
                                                    case "asignacion":

                                                        if(option[o][u]!=""){
                                                        var asi = JSON.parse(option[o][u]);

                                                                grupo[form[i].grupo]+= "data-padre='"+asi.join(',')+"' ";

                                                        }

                                                    break;
                                                    default:
                                                        grupo[form[i].grupo]+= "data-"+u+"='"+option[o][u]+"' ";
                                                    break;
                                                }
                                            }
                                            grupo[form[i].grupo]+=">"+option[o].texto+"</option>";
                                            }
                                        }
                                    }

                                grupo[form[i].grupo]+="</select>"; 
                            }
                             
                            grupo[form[i].grupo]+='<div class="small text-muted">'+form[i].texto+'</div>';
                        break;
                        case "select-grande":
                            grupo[form[i].grupo]+='<div class="text-muted">'+form[i].label+"</div>";

                            if(form[i].valor!=""){
                            var option = {};
                                option = JSON.parse(form[i].valor);

                            grupo[form[i].grupo]+="<select class='form-control select2Mod  "+form[i].clase+"' name='"+form[i].nombre+"' data-objetivo='"+(typeof option.objetivo!=="undefined" ? option.objetivo:"")+"' "+
                                "onChange='"+(typeof option.onChange ==="undefined"? "":option.onChange)+"'"+
                                (typeof option.otros!=="undefined" ? "data-otros='1' data-objetivo-otros='"+option.otros_objetivo+"'":"")+

                                ">";
                            grupo[form[i].grupo]+='<option value=""></option>';
                            if(typeof option.otros!=="undefined"){
                                if(option.otros==1){
                                    grupo[form[i].grupo]+='<option value="otros" data-funcionalidad="otros" data-objetivo-otros="'+option.otros_objetivo+'">Otros</option>';
                                }
                            }   
                                var tabla = "";
                                if(typeof option.db !=="undefined"){
                                   tabla = option.db;
                                    console.log("db",option.db);
                                    
                                   if(typeof window.localStorage.getItem("db_"+option.db)=="string"){
                                       var db_local = JSON.parse(window.localStorage.getItem("db_"+option.db));
                                       option = (db_local[cliente]);
                                   }
                                }

                                if(typeof option ==="undefined"){ 
                                 notifica("Error","Faltan parametros "+tabla+" por llenar")
                                 return false;
                                }

                                if(typeof option.dbg !=="undefined"){
                                
                                   if(typeof window.localStorage.getItem("dbg_"+option.dbg) ==="string"){
                                   option = JSON.parse(window.localStorage.getItem("dbg_"+option.dbg));
                                   
                                    
                                   }
                                }
                                
                                for(var o in option){
                                    let subnombre = "";
                                    let title = "";
                                        if(typeof option[o].valor !=="undefined"){
                                        grupo[form[i].grupo]+="<option data-valor='"+JSON.stringify(option[o])+"' value='"+option[o].valor+"' ";
                                        let piso_nombre = "";
                                        
                                        for(var u in option[o]){
                                            
                                            switch(u){
                                                case "id":
                                                case "valor":
                                                break;
                                                case "nombre":
                                                break;
                                                case "asignacion":
                                                    if(option[o][u]!=""){
                                                    var asi = JSON.parse(option[o][u]);
                                                            grupo[form[i].grupo]+= "data-padre='"+asi.join(',')+"' ";
                                                    }

                                                break;
                                               

                                               
                                                                                           }
                                        }
                                        let oficina_nombre = option[o].texto;
                                        
                                        
                                        grupo[form[i].grupo]+=">"+oficina_nombre+"</option>";
                                        }
                                    }

                            grupo[form[i].grupo]+="</select>";   
                            }
                            grupo[form[i].grupo]+='<div class="small text-muted">'+form[i].texto+'</div>';
                        break;
                        case "select-group":
                            grupo[form[i].grupo]+= "<div class='row'>";
                                var $ar = JSON.parse(form[i].valor);
                                for(var $ii in $ar){
                                    
                                    grupo[form[i].grupo]+= "<div class='col'>";
                                    if($ii == "valor"){
                                        
                                        $ar[$ii].valor = JSON.stringify($ar[$ii].valor);
                                    }
                                    grupo[form[i].grupo]+= acciones.campo("select",$ar[$ii]);     
                                    grupo[form[i].grupo]+= "</div>";
                                }
                            grupo[form[i].grupo]+= "</div>";
                            
                        break;
                            
                        case "select-btn":
                            grupo[form[i].grupo]+='<div class="text-muted">'+form[i].label+"</div>";
                            
                            if(form[i].valor!=""){
                            var option = {};
                                option = JSON.parse(form[i].valor);
                                
                            grupo[form[i].grupo]+="<select class='form-control "+form[i].clase+"' name='"+form[i].nombre+"' data-objetivo='"+(typeof option.objetivo!=="undefined" ? option.objetivo:"")+"' onChange='"+(typeof option.onChange ==="undefined"? "":option.onChange)+"'>";
                            grupo[form[i].grupo]+='<option value=""></option>';
                                
                                var tabla = "";
                                if(typeof option.db !=="undefined"){
                                
                                   
                                   if(window.localStorage.getItem("db_"+option.db)){
                                   tabla = option.db;
                                   var db_local = JSON.parse(window.localStorage.getItem("db_"+option.db));
                                   
                                   option = (db_local[cliente]);
                                    
                                   
                                   }
                                }
                                
                                if(typeof option ==="undefined"){ 
                                    notifica("Error","Faltan parametros "+tabla+" por llenar")
                                    return false;
                                }
                                
                                if(typeof option.dbg !=="undefined"){
                                   
                                   if(window.localStorage.getItem("dbg_"+option.dbg)){
                                    
                                   var db_local = JSON.parse(window.localStorage.getItem("dbg_"+option.dbg));
                                   option = (db_local);
                                   
                                   }
                                }
                                    
                                    for(var o in option){
                                        
                                        grupo[form[i].grupo]+="<option value='"+option[o].valor+"' ";
                                        for(var u in option[o]){
                                            switch(u){
                                                case "valor":
                                                break;
                                                case "texto":
                                                break;
                                                case "asignacion":
                                                    
                                                    if(option[o][u]!=""){
                                                    var asi = JSON.parse(option[o][u]);
                                                        
                                                            grupo[form[i].grupo]+= "data-padre='"+asi.join(',')+"' ";
                                                        
                                                    }
                                                    
                                                break;
                                                default:
                                                    grupo[form[i].grupo]+= "data-"+u+"='"+option[o][u]+"' ";
                                                break;
                                            }
                                        }
                                                
                                        grupo[form[i].grupo]+=">"+option[o].texto+"</option>";
                                    }
                                
                            grupo[form[i].grupo]+="</select>";   
                            }
                             
                            grupo[form[i].grupo]+='<div class="small text-muted">'+form[i].texto+'</div>';
                        break;

                    }
                    grupo[form[i].grupo]+='</div>';
                    grupo[form[i].grupo]+='</div>';
                }
            }
        var nivel = 0;
        var html2 = "";
        for(var o in grupos){
            if(typeof grupo[grupos[o].id] !=="undefined"){
            html+="<div class='pt-1 grupos "+(nivel==0? " activo":"")+"' data-id='"+grupos[o].id+"' data-otro='"+o+"'>"+
                //"<div class='border-bottom border-warning'><strong>"+grupos[o].nombre+"</strong></div>"+
                grupo[grupos[o].id]+
            "</div>";
            html2+="<td><a data-id='"+grupos[o].id+"' class='btn ml-1 btnGrupo "+(nivel==0? " btn-primary":"")+" btn-default btn-sm'><i class='fa-2x "+grupos[o].icono+"'></i></a></td>";
            nivel++;
            }
        }
        /*if(typeof grupo[0] !=="undefined"){
            html+="<div class='border grupos' data-id='0'>"+
                "<div class='border-bottom border-warning'><strong>Sin definir</strong></div>"+
                (typeof grupo[0] !=="undefined" ?grupo[0]:"")+
            "</div>";
        html2+="<td><a class='btn btn-default btnGrupo' data-id='0'><i class='ion ion-md-bookmark'></i></a></td>";
        }*/
        html2+="<td class='btnGuardarFormulario pl-1'><a class='btn btn-danger btn-sm guardaFormulario'><i class='fa fa-2x fa-save'></i></a></td>";
        var html3="<div class='flotante'>"+
            "<div class='p-1'><table class='width:100%'>"+
                html2+
            "</table>"+
            "</div>"+    
            "</div>";
    
        html+="</div>";
        html+="<input type='hidden' name='cliente' value='"+cliente+"'>";
        html+="<input type='hidden' name='acc' value='agregar'>";
        html+="<input type='hidden' name='id' value='"+id_elemento+"'>";
        $(form_id).html(html);
        $('.activaOnChange').on('change',function(){
            
            
            var clasess = $(this).prop('class').split(" ");
            for(var ic in clasess){
                /* DESBLOQUEA CAMPO*/
                let posicion = clasess[ic].indexOf("objetivo-");
                if (posicion !== -1){
                    $('.'+clasess[ic].replace("objetivo-",'')).removeClass('d-none');
                }
               
                
            }
            
             /* LLAMAPADRE */
            if($(this).hasClass('leePadre')){
                var $codigo = $(this).val();
                
                var $q = base.query("select * from "+tabla_activos+" where codigo='"+$codigo+"'",function(res){
                    console.log(res);
                    if(res.rows.length>0){
                    acciones.pueblaPreRegistro(res.rows[0]);
                    }else{
                        notifica("No existen resultados para su consulta","","warning");
                    }
                });
                
            }
            
            
        });
        //$('[name="custodio"] option').addClass('d-none');
        //$('[name="custodio"] option[data-cliente="'+cliente+'"]').removeClass('d-none');
        if($('.flotante').length == 0) $(form_id).parent().append(html3);
        
        $('.select2').each(function() {
            //select2
            let selectIn = this;
            if(!$(this).hasClass('select2-base')){
            $(this)
              .wrap('<div class="position-relative"></div>')
              .select2({
                theme:"dark",
                placeholder: 'Seleccione un valor',
                dropdownParent: $(this).parent(),
                templateResult: function(state,container){
                    //console.log(state.element);
                    if(state.element) {
                        $(container).addClass($(state.element).attr("class"));
                    }
                    var $dataSubnombre = $(state.element).attr("data-subnombre");
                    var $return = $('<div class="text-bold">'+state.text+'<div class="small">'+($dataSubnombre? $dataSubnombre+': ':'')+state.title+'</div></div>');
                    //var $return = $('<div class="text-bold">'+state.text+'<div class="small">'+($dataSubnombre? $dataSubnombre+': ':'')+state.title+'</div></div>');
                    return $return;
                },
                templateSelection: function (data, container) {
                    // Add custom attributes to the <option> tag for the selected option
                    $(data.element).attr('data-custom-attribute', data.customValue);
                    return data.text;
                }

              });
            }else{
                let data_raw = JSON.parse(window.localStorage.dbg_activoModelos);
                for(let data_ of data_raw){
                    let objetoEncontrado = dataModelos.find(item => item.id === data_.valor);
                    if(typeof objetoEncontrado=="undefined")
                    dataModelos.push({id:data_.valor,text:data_.texto});
                }
                $(this)
                .wrap('<div class="position-relative"></div>')
                .select2({
                    placeholder: "Busca un modelo",
                    language: {
                        searching: function () {
                            return "Buscando.."; // Elimina el texto "Searching..."
                        },
                        noResults: function () {
                            return "No se encontraron resultados"; // Mensaje personalizado
                        }
                    },
                    ajax: {
                        transport: function(params, success, failure) {
                            // Filtrar datos localmente
                            const term = params.data.q || ''; // Obtener el término de búsqueda
                            const results = dataModelos.filter(item => 
                                item.text.toLowerCase().includes(term.toLowerCase())
                            );
                            const finalResults = [{ id: 'otros', text: 'Otros' }, ...results];
                            success( {results:finalResults} ); // Retornar resultados a Select2
                        },
                        processResults: function(data) {
                            
                            return data // Select2 espera un objeto con la clave `results`
                        }
                    },
                    minimumInputLength: 1 // Mínimo de caracteres para buscar,
                    
                    

                });  
            }
            //otros
            $(this).on("change",function(){
                var op = $(this).find('option:selected');
                if(typeof op.attr('data-objetivo-otros')!="undefined" && op.attr('data-objetivo-otros')!=""){
                    $('.'+op.attr('data-objetivo-otros')).removeClass('d-none');
                }else if(typeof $(this).attr('data-otros')!=="undefined"){
                    $('.'+$(this).attr('data-objetivo-otros')+'').addClass('d-none')
                }
            })
          })
        $('.select2Mod').each(function() {
            //select2
            let selectIn = this;
            $(this)
              .wrap('<div class="position-relative"></div>')
              .select2({
                theme:"dark",
                placeholder: 'Seleccione un valor',
                dropdownParent: $(this).parent(),
                templateResult: function(state,container){
                    //console.log(state.element);
                    if(state.element) {
                        $(container).addClass($(state.element).attr("class"));
                    }
                    //var $dataSubnombre = $(state.element).attr("data-subnombre");
                    let dividido = state.text.split('|');
                    let texto = "";
                    let otros = [];
                    for(let inco in dividido){
                        if(inco==0){
                            texto+='<div class="text-bold">'+dividido[dividido.length-1]+
                                '<div class="small">';
                        }

                            otros.push(dividido[inco]);
                        
                    }
                    console.log("otros",dividido.length,otros)
                    if(dividido.length>3) otros.pop();
                    if(dividido.length==3){
                         texto+= otros[0] +" : "+ otros[1];
                    }else texto+=otros.join(" : ");
                    texto+='</div></div>';
                    var $return = $(texto);
                    //var $return = $('<div class="text-bold">'+state.text+'<div class="small">'+($dataSubnombre? $dataSubnombre+': ':'')+state.title+'</div></div>');
                    return $return;
                },
                templateSelection: function (data, container) {
                    // Add custom attributes to the <option> tag for the selected option
                    $(data.element).attr('data-custom-attribute', data.customValue);
                    let div_ = data.text.split('|');
                    return (div_.length==1? data.text:div_[div_.length-1]+": "+data.text.split('|').join(' -> '));
                }

              });
            //otros
            $(this).on("change",function(){
                var op = $(this).find('option:selected');
                if(typeof op.attr('data-objetivo-otros')!="undefined" && op.attr('data-objetivo-otros')!=""){
                    $('.'+op.attr('data-objetivo-otros')).removeClass('d-none');
                }else if(typeof $(this).attr('data-otros')!=="undefined"){
                    $('.'+$(this).attr('data-objetivo-otros')+'').addClass('d-none')
                }
            })
          })
        $(".mascaraAno").each(function(){
            vanillaTextMask.maskInput({
                inputElement: this,
                mask: [/\d/, /\d/, /\d/, /\d/],
                pipe: textMaskAddons.createAutoCorrectedDatePipe('yyyy')
              });
        })
        $(".mascara").each(function(){
            vanillaTextMask.maskInput({
                inputElement: this,
                mask: [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/],
                pipe: textMaskAddons.createAutoCorrectedDatePipe('yyyy/mm/dd')
              });
        })
        $('select.miro').on("change",function(){
            var d = $(this).find('option:selected').attr('data-valor');
            $('.mira').addClass('d-none');
            if(typeof d !=="undefined" && d!=""){
               
                let mira = JSON.parse(d);
                if(typeof mira.mira!=="undefined" && mira.mira!="")
                $('.mira.'+mira.mira).removeClass('d-none');
            }
        });
        
        
        $('.btnGrupo').unbind().on("click",function(){
           var id = $(this).attr('data-id');
           
            $(form_id+' .grupos').removeClass('activo');
            $('.grupos[data-id="'+id+'"]').addClass('activo');
            $('.btnGrupo').removeClass('btn-primary').addClass('btn-default');
            $('.btnGrupo[data-id="'+id+'"]').addClass('btn-primary').removeClass('btn-default');
            
        });
        var mueveP = this.muevePantalla;
        var base = this.base;
		
        $('.guardaFormulario').unbind().on("click",function(){
            
                var datos     = $(form_id).serialize();
                var arreglo   = {};
                var inputs    = $(form_id+' input');
                var selects   = $(form_id+' select');
                var textareas = $(form_id+' textarea');
                var persistentes = [];
                var imagenes = [];
                let coordenadas = [];
                let mensajes_errores = [];
                let errores = 0;
                $.each(inputs,function(n,el){
                    switch($(el).attr('name')){
                        case "imagen":
                        var vari = {
                            "name":$(el).attr('data-name'),
                            "valor":$(el).val()
                        }
                        if($(el).val()=="" && $(el).hasClass('required')){
                            errores++;
                            mensajes_errores.push("Falta la "+$(el).attr('data-name'))
                        }
                        imagenes.push(vari);     
                        break;  
                        default:
                            
                            if($(el).attr('type')=="checkbox"){
                                if($(el).prop('checked')){
                                    console.log($(el).attr('name'),$(el).val());
                                    errores++;
                                    arreglo[$(el).attr('name')] = $(el).val();     
                                }
                            }else{
                                if($(el).hasClass('required') && $(el).val()==""){
                                    $(el).addClass('border-danger');
                                    mensajes_errores.push($(el).attr('name'));
                                    errores++;
                                }else{
                                    $(el).removeClass('border-danger');
                                }
                                
                                if(typeof $(el).attr('data-name') !=="undefined"){ 
                                    if(typeof arreglo[$(el).attr('name')] === "undefined") arreglo[$(el).attr('name')]={};
                                    arreglo[$(el).attr('name')][$(el).attr('data-name')] = $(el).val();
                                }else{
                                    if($(el).attr('name').indexOf('coordenadas')>=0){
                                        if($(el).val()!="") coordenadas.push(JSON.parse($(el).val())); else
                                        coordenadas.push(acciones.obtieneCoordenadas('[name="coordenadas"]'))
                                    }else{

                                    arreglo[$(el).attr('name')] = $(el).val();
                                    }
                                }
                            }

                            if($(el).hasClass('persistente')){
                                persistentes.push({
                                    "nombre":$(el).attr('name'),
                                    "valor":$(el).val(),
                                    "tipo":"input"
                                });

                            }
                        break;
                    }
                    


                });
                
                
                arreglo["coordenadas"] = JSON.stringify(coordenadas);
                
                //JSON.parse()

                $.each(selects,function(n,el){

                    if(typeof $(el).attr('data-name') !=="undefined"){
                        if(typeof arreglo[$(el).attr('name')] === "undefined") arreglo[$(el).attr('name')]={};
                        arreglo[$(el).attr('name')][$(el).attr('data-name')] = $(el).val();
                    }else{ 
                        //if($(el).attr('name')=="modelo"){
                            //arreglo[$(el).attr('name')] = JSON.stringify({"nombre":$(el).text(),"valor":$(el).val()});
                        //}else{
                        arreglo[$(el).attr('name')] = $(el).val();
                        //}
                        
                        if($(el).hasClass('required') && $(el).val()==""){
                                $(el).addClass('border-danger');
                                mensajes_errores.push($(el).attr('name'));
                                errores++;
                        }else{
                            $(el).removeClass('border-danger');
                        }
                    }
                    
                    if($(el).hasClass('persistente')){
                        persistentes.push({
                            "nombre":$(el).attr('name'),
                            "valor":$(el).val(),
                            "tipo":"select"
                        });

                    }
                })
                if(errores == 0){
					if(confirm("Está seguro que desea guardar?")){
						$.each(textareas,function(n,el){

							if(typeof $(el).attr('data-name') !=="undefined"){
								if(typeof arreglo[$(el).attr('name')] === "undefined") arreglo[$(el).attr('name')]={};
								arreglo[$(el).attr('name')][$(el).attr('data-name')] = $(el).val();
							}else arreglo[$(el).attr('name')] = $(el).val();
							 if($(el).hasClass('persistente')){
								persistentes.push({
									"nombre":$(el).attr('name'),
									"valor":$(el).val(),
									"tipo":"textarea"
								});

							}
						})
						window.localStorage.persistentes=(JSON.stringify(persistentes));

						$(form_id).trigger('reset');
						if(window.localStorage.formulario_id==0){
							$.each(selects,function(n,el){
								$(el).val('').trigger('change');
							});
							$('.contenedor-imagen .abreFoto').attr('src','assets/img/icono-imagen.png');
                            $('#foto1_imagen').val('');
                            $('#foto2_imagen').val('');
                            $('#foto3_imagen').val('');
                            $('#foto4_imagen').val('');
                            $('#foto5_imagen').val('');
                            $('#foto6_imagen').val('');
                            $('#foto7_imagen').val('');
                            $('#foto8_imagen').val('');

							var grabados = JSON.parse(window.localStorage.persistentes);
							for(var io in grabados){
								switch(grabados[io].tipo){
									case "input":
									$(form_id+' [name="'+grabados[io].nombre+'"]').val(grabados[io].valor);    

									break;
									case "select":
									$(form_id+' [name="'+grabados[io].nombre+'"] option[value="'+grabados[io].valor+'"]').prop("selected","selected").trigger('change');
									break;
									case "textarea":
									$(form_id+' [name="'+grabados[io].nombre+'"]').val(grabados[io].valor);        
									break;
								}
							}
							$('.btnGrupo')[0].click();
						}

						let datos_registro = {};
						var estado = 0;
						if(arreglo["id"]!=0){
							datos_registro = JSON.parse(window.localStorage.editando);
							estado=(datos_registro.tipo==2? 3:1);
						}
                        if(arreglo["modelo_otro"]!=""){
                            dataModelos.push({
                                id:Date.now()+"_otro",
                                text:arreglo["modelo_otro"]
                            })
                            window.localStorage.dbg_activoModelos = JSON.stringify(dataModelos);
                        }
						try{
						base.insert({"tabla":"ser_registro","registro":{"registro": JSON.stringify(arreglo),"apertura":window.localStorage.apertura_formulario,"modificacion": new Date().getTime(), "fecha":"","respuesta":"","estado":estado,"remoto":arreglo["id"], "imagenes":JSON.stringify(imagenes), "codigo":arreglo["codigo_barras"], "servicio":$('#actividad').attr('data-servicio')
						}},function(){
							if(arreglo["id"]!=0){
								base.delete({"tabla":tabla_activos,"id":datos_registro.id});
								$('[data-id="'+datos_registro.id+'"].item').remove();
								acciones.muevePantalla(acciones.pestania_home);   
								acciones.botonOpciones("agregar_registro");
							}
							
							notifica("Registro guardado","","success");
							base.logs("Guarda registro",arreglo);
							acciones.obtieneDash();

						},function(res2){
							notifica("No se pudo guardar el registro: "+JSON.stringify(res2),"","error");
						});
						}catch(e){
							alert("Error al guardar: "+e);
						}
					}
					
					
                }else{
                    let mse=[];
                    
                    notifica("Campos que faltan por llenar: "+(mensajes_errores.join(", ")),"","danger");
                    
                }
                
            //}
           //
        })
        acciones.reorganizaDisenio();
        acciones.funciones("camara");
        
        this.botonOpciones("agregar_registro")
        this.servicios();
    }
    funciones(tipo){
        let acciones = this;
        let Camara = this.cam;
        switch(tipo){
            case "camara":
                $('.tomarFoto').unbind().on("click",function(){
    
               try{
               Camara.startDebajo('#'+$(this).attr('data-id'));
               }catch(e){
                   alert(e);
               }
            });
            $('.abreFoto').on("click",function(){
                acciones.llamaModal("Foto "+$(this).attr('id'),'<img src="'+$(this).attr('src')+'" class="img-fluid" />');

            });
            $('.galeriaFoto').unbind().on("click",function(){
                Camara.galeriaFoto($(this).attr('data-id'));
				//acciones.leerFoto($('#'+$(this).attr('data-id')+"_imagen").val());
                //acciones.openFilePicker($(this).attr('data-id'));
            });
            break;
        }
    }
	leerFoto(nombre){
		
		this.cam.leerFoto(nombre);
	}
    llamaModal(titulo,contenido){
        
        var html = (
					'<a class="cerrar">x</a>'+
					
					'<div class="contenido container"><div class="text-center text-white"><h4 class="mx-4 border-bottom border-white pb-4">'+titulo+'</h4></div>'+contenido+'</div>');
        
        
        
        
		if($('.fondo-negro').length==0) $('body').append('<div class="fondo-negro">'+html+'</div>'); else $('.fondo-negro').html(html);
        //$('body').append(html);
        $('.fondo-negro .cerrar').on("click",function(){
           $('.fondo-negro').remove(); 
        });
        
        
    }

    llamaModalVertical(titulo, contenido) {
        // Crear el fondo negro si no existe
        if($('.fondo-negro').length == 0) {
            $('body').append('<div class="fondo-negro"></div>');
        }
        
        // Crear estructura del modal vertical
        let modalHtml = `
            <div class="modal-vertical">
                <div class="modal-vertical-content">
                    <div class="modal-vertical-header">
                        <h5>${titulo}</h5>
                        <button type="button" class="close" onclick="interfaz.cierra('modal')">&times;</button>
                    </div>
                    <div class="modal-vertical-body">
                        ${contenido}
                    </div>
                </div>
            </div>
        `;
        
        $('.fondo-negro').html(modalHtml);
    }
    cierraModalVertical(){
        $('.fondo-negro').remove();
    }
    llamaModalTransparente(titulo,contenido){
        
        var html = (
					'<a class="cerrar">x</a>'+
					
					'<div class="container"><div class="text-center text-white"><h4 class="mx-4 border-bottom pb-4">'+titulo+'</h4></div>'+contenido+'</div>');
        
        
        
        
		if($('.fondo-negro').length==0) $('body').append('<div class="fondo-negro">'+html+'</div>'); else $('.fondo-negro').html(html);
        //$('body').append(html);
        $('.fondo-negro .cerrar').on("click",function(){
           $('.fondo-negro').remove(); 
        });
        
        
    }
    obtieneUbicacion(btn){
        try{
        navigator.geolocation.getCurrentPosition(function(position){
             console.log('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
              'Timestamp: '         + position.timestamp                + '\n');
            $(btn).val('{"latitude":"'+position.coords.latitude+'","longitude":"'+position.coords.longitude+'","accuracy":"'+position.coords.accuracy+'"}');
            
            //,"speed":"'+position.coords.speed+'"
        }, function(){
            
        },{ enableHighAccuracy: true });
    }catch(e){
        notifica('Error', 'No se pudo obtener la ubicacion, el dispositivo no logra encontrar funciones GPS','danger');
    }
    }
    obtieneCoordenadas(btn){
        var nombre = ($(btn).attr('data-objetivo'));
        console.log(nombre);
        $(btn).find('i').removeClass('fa-map');
        $(btn).find('i').addClass('fa-spin fa-spinner');
        try{
        navigator.geolocation.getCurrentPosition(function(position){
             console.log('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
              'Timestamp: '         + position.timestamp                + '\n');
            $(btn).find('i').addClass('fa-map').removeClass('fa-spin fa-spinner'); $('[name="'+nombre+'"]').val('{"latitude":"'+position.coords.latitude+'","longitude":"'+position.coords.longitude+'","accuracy":"'+position.coords.accuracy+'"}');
            
            //,"speed":"'+position.coords.speed+'"
        }, function(){
            
        },{ enableHighAccuracy: true });
        }catch(e){
            notifica('error','No se puede obtener la ubicacion, el dispositivo no resuelve la ubicacion GPS','danger')
        }
    }
    botonOpciones(t){
        let acciones = this;
        
        switch(t){
            case "agregar_registro":
            
            if(typeof window.localStorage.proyecto ==="string"){
            
            $('#boton_opciones').unbind().on("click",function(res){
                window.localStorage.apertura_formulario = new Date().getTime(); // obtengo la fecha de apertura del formulario
                window.localStorage.formulario_id = 0; //
                acciones.muevePantalla(acciones.pestania_formulario); //muevo a la pestaña del usuario
                $(this).html('<i class="fa fa-history"></i>').removeClass('btn-primary btn-danger d-none').addClass('btn-success').unbind().on("click",function(){
                    acciones.botonOpciones('agregar_registro');
                    acciones.muevePantalla(acciones.pestania_activos);
                });
            })//html('<i class="fa fa-plus"></i>').addClass('btn-danger').removeClass('btn-primary btn-secondary d-none disabled');
                
                
            }
            //acciones.obtieneCoordenadas();
            break;
            case "editar_activo":
                $('#boton_opciones').html('<i class="fa fa-history"></i>').removeClass('d-none').addClass('btn-success').unbind().on("click",function(){
                    acciones.botonOpciones('agregar_registro');
                    acciones.muevePantalla(acciones.pestania_home);
                });         
            break;
        }
            
    }
	btnAgregarInventario(){
		let acciones = this;
		$('.agregarFormulario').unbind().on("click",function(e){        
                    
			window.localStorage.apertura_formulario = new Date().getTime(); // obtengo la fecha de apertura del formulario
			window.localStorage.formulario_id = 0; //
			var btn = $(this);
			let btn_servicio = $(this).attr('data-servicio');
			$('#actividad').attr('data-servicio',btn_servicio);
			acciones.formulario(window.localStorage.cliente,btn_servicio);

			acciones.muevePantalla(acciones.pestania_formulario); //muevo a la pestaña del usuario



		}).removeClass('disabled btn-default').addClass('btn-danger text-white');
		
		
		
		//html+='<div class="text-center"><br><br><input type="checkbox" name="recordar-validar">&nbsp;&nbsp;No volver a preguntar</div>';
		$('#generarPDF').unbind().on("click",function(){
            acciones.generarPDF();
        }).removeClass('disabled btn-default').addClass('btn-danger text-whte')
		$('#validarInventario').unbind().on("click",function(e){
			acciones.listadoValidacion();
            
		}).removeClass('disabled btn-default').addClass('btn-danger text-white');
		
	}
    llamaEscanerValidar(){
        const acciones = this;
        let html = "<br><br><div class='text-center text-white'>Debe apuntar la camara del dispositivo al código de barras/Qr, una vez escaneado la aplicación le va indicar si el activo existe en el listado.</div><br><br>";
		html+='<div class="text-center"><a data-objetivo="buscarCodigo" class="btn btn-danger text-white escanearCodigo">Escanear</a></div>';
        acciones.llamaModal('Instrucciones para validar un activo:',
            html			   
           );
           acciones.botones();
           
    }
    leerArchivoRescate(file_){
        return new Promise(resolve => {
		 
            fileEntry.file(function (file) {
               var reader = new FileReader();
               reader.onloadend = function() {
                       resolve(this.result);	
               };
   
               reader.readAsText(file);
   
           }, function(e){
               alert("Error leer: "+e);
           });
            
       })
    }
    listadoArchivos(){
        const acciones = this;
        $('#listadoArchivos').html('')
        let html = ""
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "fotos/", function (directoryEntry) {
            var directoryReader = directoryEntry.createReader();
        
            // Leer el contenido de la carpeta
            directoryReader.readEntries(function (entries) {
                if (entries.length === 0) {
                    $('#listadoArchivos').html('<p>No hay archivos en la carpeta</p>');
                    return;
                }
        
                let archivosProcesados = 0; // Para rastrear cuántos archivos se han procesado
        
                entries.forEach(function (entry) {
                    if (entry.isFile) {
                        entry.file(function (file) {
                            var reader = new FileReader();
        
                            reader.onload = function (event) {
                                var contenido = event.target.result; // Contenido del archivo
                               
                                contenido=contenido.split('[')[0]
                                html += `<div class="col is-12" data-archivo="${entry.name}"><div class="cols"><div class="col"><img src="data:image/jpeg;base64,${contenido}" width="100%"></div><div class="col">${entry.name}</div></div></div>`;
                                
                                archivosProcesados++;
        
                                // Actualizar el contenido cuando se hayan leído todos los archivos
                                if (archivosProcesados === entries.length) {
                                    $('#listadoArchivos').html('<div class="cols">'+html+'</div>');
                                }
                            };
        
                            reader.onerror = function (error) {
                                console.error("Error al leer el archivo: ", error);
                                archivosProcesados++;
        
                                if (archivosProcesados === entries.length) {
                                    $('#listadoArchivos').html('<div class="cols">'+html+'</div>');
                                }
                            };
        
                            reader.readAsText(file); // Leer el archivo como texto
                        }, function (error) {
                            console.error("Error al obtener el archivo: ", error);
                        });
                    } else {
                        archivosProcesados++;
        
                        // Actualizar si se procesan todos los archivos (incluso directorios)
                        if (archivosProcesados === entries.length) {
                            $('#listadoArchivos').html(html);
                        }
                    }
                });
            }, function (error) {
                alert("Error al leer la carpeta: " + error);
            });
        }, function (error) {
            alert("Error al acceder a la carpeta: " + error);
        });  
        acciones.muevePantalla(11)

    }
    generarPDF(){
        const acciones = this;

        acciones.muevePantalla(10)
    }
    listadoValidacion(){
        const acciones = this;
        let html = "";
        try{
            acciones.base.query({"tabla":tabla_activos},async function(e){
                
                if(e.length>0){
                    
                    for(let ac_ of e){
                        let registro = JSON.parse(ac_.registro);
                        
                        html+='<div class="item border-bottom pb-2 pt-2">'+
                       
                            '<div class="row">'+
                                '<div class="col is-8">'+
                                    '<strong>'+ac_.codigo+'</strong>'+
                                    '<div class="text-small small"><b>Código Anterior: </b>'+(typeof registro.codigo_barras_anterior !="undefined"? registro.codigo_barras_anterior:"")+'</div>'+
                                    '<div>'+(typeof activosAgrupados[registro.agrupados]!="undefined"? activosAgrupados[registro.agrupados]:"")+'</div>'+
                                '</div>'+
                                '<div class="col is-4">'+
                                    '<div class="text-right">'+
                                        '<a class="btn btn-sm btn-primary" href="javascript:void(interfaz.verActivo(\''+ac_.id+'\',\''+ac_.codigo+'\'))">ver activo</a>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                       // '</div>'+
                        '</div>';
                        alert(html);
                    }
                }else{
                    console.log("No hay registros en la tabla",tabla_activos);
                }
                $('#listadoArticulos').html(html).removeClass('d-none');
        });
    }catch(e){  
        console.warn("listadoValidacion",e)
    }
       
            $('[name="qr_busqueda"]').on('keyup', function () {
                const query = $(this).val().toLowerCase(); // Texto ingresado
                if(query==""){
                    $('#listadoArticulos .item').removeClass('d-none')
                }else{
                $('#listadoArticulos .item').each(function () {
                    const content = $(this).text().toLowerCase(); // Texto del div.item
                    if (content.includes(query)) {
                        $(this).removeClass('d-none'); // Mostrar si coincide
                    } else {
                        $(this).addClass('d-none'); // Ocultar si no coincide
                    }
                });
            }
            });
            
        
        acciones.muevePantalla(3);
    }
    servicios(){
        var i = JSON.parse(window.localStorage.servicios);
        for(var v in i){
            
            if(typeof formulario[i[v].id] ==="undefined") formulario[i[v].id]={};
            formulario[i[v].id].campos = i[v].formulario.campos;
            formulario[i[v].id].grupos = i[v].formulario.grupos;
        }
    }
    openFilePicker(selection) {
        var acciones = this;
        if(typeof Camera !=="undefined"){
        try{
        var srcType = Camera.PictureSourceType.PHOTOLIBRARY; //SAVEDPHOTOALBUM;
        var options = acciones.setOptions(srcType);
        var func = acciones.createNewFileEntry;

        navigator.camera.getPicture(function cameraSuccess(imageUri) {

            //alert(imageUri);

        }, function cameraError(error) {
            alert("Unable to obtain picture: " + error, "app");

        }, options);
        
        }catch(e){
            alert(e);
        }
            }else{
            alert("Faltan los permisos o el plugin de Camara");
        }
    }
    createNewFileEntry(imgUri) {
    window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {
 
        // JPEG file
        dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {
 
            // Do something with it, like write to it, upload it, etc.
            // writeFile(fileEntry, imgUri);
            alert("got file: " + fileEntry.fullPath);
            // displayFileData(fileEntry.fullPath, "File copied to");
 
        }, onErrorCreateFile);
 
    }, onErrorResolveUrl);
}
    setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL, // DIRECCION ARCHIVO
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        //encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true,
        saveToPhotoAlbum: false,
    }
    return options;
    }
    
    /* CAMPOS */
    campo(tipo,form){
        var html = "";
        
        switch(tipo){
            case "select":
                let clase = "";
                html+='<div class="text-muted">'+form.label+"</div>";
                            
                            if(form.valor!=""){
                            var option = {};
                                if(typeof form.valor==="string") option = JSON.parse(form.valor); else option =form.valor;  
                                if(typeof form.clase !=="undefined") clase = form.clase; else clase ="";
                            html+="<select class='form-control select2 "+form.clase+"' name='"+form.nombre+"' data-objetivo='"+(typeof option.objetivo!=="undefined" ? option.objetivo:"")+"' "+
                                "onChange='"+(typeof option.onChange ==="undefined"? "":option.onChange)+"'"+
                                (typeof option.otros!=="undefined" ? "data-otros='1' data-objetivo-otros='"+option.otros_objetivo+"'":"")+
                                
                                ">";
                                console.log(form.nombre,form.clase)
                            html+='<option value=""></option>';
                            if(typeof option.otros!=="undefined"){
                                if(option.otros==1){
                                    html+='<option value="otros" data-funcionalidad="otros" data-objetivo-otros="'+option.otros_objetivo+'">Otros</option>';
                                }
                            }   
                                var tabla = "";
                                if(typeof option.db !=="undefined"){
                                
                                   
                                   if(window.localStorage.getItem("db_"+option.db)){
                                   tabla = option.db;
                                   var db_local = JSON.parse(window.localStorage.getItem("db_"+option.db));
                                   
                                   option = (db_local[cliente]);
                                    
                                   
                                   }
                                }
                                
                                if(typeof option ==="undefined"){ 
                                    notifica("Error","Faltan parametros "+tabla+" por llenar")
                                    return false;
                                }
                                
                                if(typeof option.dbg !=="undefined"){
                                   
                                   if(window.localStorage.getItem("dbg_"+option.dbg)){
                                    
                                   var db_local = JSON.parse(window.localStorage.getItem("dbg_"+option.dbg));
                                   option = (db_local);
                                   
                                   }
                                }
                                    if(!clase.includes('select2-base')){
                                    for(var o in option){
                                        
                                        html+="<option value='"+option[o].valor+"' ";
                                        for(var u in option[o]){
                                            switch(u){
                                                case "valor":
                                                break;
                                                case "texto":
                                                break;
                                                case "asignacion":
                                                    
                                                    if(option[o][u]!=""){
                                                    var asi = JSON.parse(option[o][u]);
                                                        
                                                            html+= "data-padre='"+asi.join(',')+"' no-padre";
                                                        
                                                    }
                                                    
                                                break;
                                                default:
                                                    html+= "data-"+u+"='"+option[o][u]+"' ";
                                                break;
                                            }
                                        }
                                                
                                        html+=">"+option[o].texto+"</option>";
                                    }
                                }
                                
                            html+="</select>";   
                            }
                             
                            if(typeof form.texto!="undefined") html+='<div class="small text-muted">'+form.texto+'</div>';
                
                
                
            break;
        }
        return html;
    }
    
    
    
    /* campos */
    irSeccion(tipo,io){
        const acciones = this;
        $('#layout-sidenav .sidenav-item').removeClass('active');    
        $(io).addClass('active');
        switch(tipo){
            case "dashboard":
            
            this.muevePantalla(0);
            
            break;
            case "registros":
            $('#boton_opciones').unbind().addClass('btn-success').removeClass('d-none btn-danger btn-primary').html('<i class="fa fa-search"></i>').on("click",function(){
                alert("Consulta REgistros");
                acciones.consultaRegistro();
            });
            this.muevePantalla(5);
            break;
            case "validar":
                alert("Validar")
                acciones.listadoValidacion()
                
            break;
        }
    }
    pueblaPreRegistro(datos){
        
     
        var $formu_n = '#formularios';
        var $formu = $('#formularios');
        var $campo = JSON.parse(datos.registro);
        
        for(var $ii in $campo){
            switch($ii){
                case "codigo_barras":
                break;
                case "codigo_barras_anterior":
                break;
                case "activo_padre":
                break;
                default:
                $($formu_n+' [name="'+$ii+'"]').val($campo[$ii]).trigger('change');
                console.log($ii,$campo[$ii]);
                break;
            }
        }
       
        
        
        
    }
    onOnline(){
        const acciones = this;
	"use strict";
	$.post(_DOMINIO_,{"acc":"conexion"},function(res){
		if(!connectionStatus){
                acciones.Online(true)
				//if(evento!="Mapa") llamaScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyC6EsU274r4xL4fN8E-nqBOVXC5yQ1kGP8&callback=inicializa&language=es");
				//notifica("Estado de RED","La aplicación se encuentra <strong>ONLINE</strong>, iniciando el proceso de sincronización","success");
			}
			connectionStatus = true;
	}).fail(function(e){
        acciones.Online(false)
		//if(connectionStatus) notifica("ERROR","No se detecta conexión, SERVICIOS ESTA EN MODO OFFLINE");
		connectionStatus = false;	
	});
		
}
    encryptar(){
        
        var key256 = CryptoJS.SHA256(this.key).toString()
        key256 = key256.substr(0,32)
        var iv256 = CryptoJS.SHA256(this.iv).toString()
        iv256 = iv256.substr(0,16);


        var encrypted = CryptoJS.AES.encrypt("Echo2", 
            CryptoJS.enc.Utf8.parse(key256), { 
            iv: CryptoJS.enc.Utf8.parse(iv256),
            mode: CryptoJS.mode.CBC 
        });
        var r1 = encrypted.ciphertext.toString(); // def44f8822cfb3f317a3c5b67182b437
        var r2 = CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
        //console.log(r1);
        return (utf8_to_b64(r2));
    }
    dencryptar(txt){
        let iv = (CryptoJS.SHA256(this.iv).toString()).substr(0,16);
        let key = (CryptoJS.SHA256(this.key).toString()).substr(0,32);
        //console.log(txt);
        //console.log(b64_to_utf8(b64_to_utf8(txt)));
        const result = CryptoJS.AES.decrypt(txt, CryptoJS.enc.Utf8.parse(key), {
          iv:CryptoJS.enc.Utf8.parse(iv),
          mode: CryptoJS.mode.CBC,
          //format: CryptoJS.format.Hex
        });
        
        return (result.ciphertext.toString());
        
    }
    /* ARCHIVOS */
    
    savefile(dataurl){
    try{
    let acciones = this;
    let app_folder_name = "fotos";
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
    function (fileSystem) {
        fileSystem.root.getDirectory( app_folder_name, {create:true, exclusive: false},
        function(directory) {
            directory.root.getFile("image.jpg", {create: true, exclusive: false}, 
            function (fileEntry) {
                fileEntry.createWriter(function (writer) {
                    console.log("Start creating image file");
                    writer.seek(0);
                    writer.write(dataurl);
                    console.log("End creating image file. File created");
                }, acciones.fail);
            }, acciones.fail);
        }, acciones.fail);
    }, acciones.fail);
    }catch(e){
        alert(e);
    }
}


	reorganizaDisenio(){
		//$('input[type="text"]').focus(function() { $(window).setAutoScrolling (false); })
		
		$('input[type="text"]').blur(function() {
		
			$('html, body').animate({
			scrollTop: 0
		}, 300, function(){

				window.scrollTo(0, 0);
		  });
		
		})
		$('textarea').blur(function() {
		
			$('html, body').animate({
			scrollTop: 0
		}, 300, function(){

				window.scrollTo(0, 0);
		  });
		
		});
	}

    fail(){
        console.log("Error");
    }
    
    
    /* ARCHIVOS */
}
