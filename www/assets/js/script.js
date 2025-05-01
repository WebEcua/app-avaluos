// JavaScript Document
var sistema = window.localStorage;
var meses = ["","Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
var map;
var origen = [], infoWindow= [], codigos=[], docSinc=["furtas"];
var destino = [];
var marcadores = [];
var mDestino = "", cDestino;
var $tarjetas, mLat, mLng;
var totalOrdenes = 0;
var directionsDisplay;
var evento;
var directionsService;
var fecha_actual = new Date();
var mes_actual;
var icono;4
var debug = 0;
var accion;
var formulario = [];
var connectionStatus = true;
var base;
var base_datos = "sistema39";
var $cordovaDevice;
var $cordovaFile;
let dataModelos = [];
const base_datos_version = "2.4";
var errList=['SyntaxError','TypeError','RangeError','URIError'];
const tabla_activos   = "ser_activos";
const tabla_registros = "ser_registro";

var _DOMINIO_ = 'https://gestor.work/webservice';
var oficina = [];
/* interfaz */
let interfaz;



$(function(){
    
   try{ 
    $('#layout-sidenav').each(function() {
    new SideNav(this, {
      orientation: $(this).hasClass('sidenav-horizontal') ? 'horizontal' : 'vertical'
    });
    cordova.plugins.permissions.checkPermission(
        cordova.plugins.permissions.ACCESS_FINE_LOCATION,
        function (status) {
            if (!status.hasPermission) {
                cordova.plugins.permissions.requestPermission(
                    cordova.plugins.permissions.ACCESS_FINE_LOCATION,
                    function () {
                        console.log("Permiso concedido");
                    },
                    function () {
                        console.error("Permiso denegado");
                    }
                );
            }
        },
        function (error) {
            console.error("Error al verificar permisos:", error);
        }
    );
    
  });
	   
    $('body').on('click', '.layout-sidenav-toggle', function(e) {
        e.preventDefault();
        window.layoutHelpers.toggleCollapsed();
        if (!window.layoutHelpers.isSmallScreen()) {
        try { localStorage.setItem('layoutCollapsed', String(window.layoutHelpers.isCollapsed())); } catch (e) {}
        }
    });
  if(typeof window.localStorage.cliente !=="undefined") $('#botonera').removeClass('d-none');
  //$('html').addClass('layout-navbar-fixed');
  if ($('html').attr('dir') === 'rtl') {
    $('#layout-navbar .dropdown-menu').toggleClass('dropdown-menu-right');
  }

    
    interfaz = new Sistema('#formularios',_DOMINIO_);
    alert();
    //interfaz.init();
    if( /MacIntel/i.test(navigator.platform) ) {
    interfaz.init();
    }
       
       
    
	abreEvento();
    $('#sincronizar').on("click",function(){
       interfaz.sincronizar(); 
    });
    $('#consultaRegistros').on("click",function(){
       interfaz.consultaRegistro(); 
    });
    
	$('#connectButton').on("click",function(){
		
		app.initialize();			
	});
   }catch(error){
    
       alert("Error"+error+" ="+JSON.stringify(error));
   }

   //cargo modelos
 



    //interfaz.encryptar("Echo2");
    //console.log(interfaz.dencryptar("NGdvTDM1WDBvRXBLeW9nN2h0QndEdz09"));
})
document.addEventListener('deviceready', function () {
    interfaz.init();
	$cordovaDevice = device;
})

function llamaScript(url) {
	"use strict";
    var script = document.createElement("script"); //Make a script DOM node
    script.src = url; //Set it's src to the provided URL
    document.head.appendChild(script); //Add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}
function abreEvento(){
	"use strict";

	
	
	debug=1;
	$tarjetas = $('#tarjetas');
	
	$tarjetas.carousel({
		interval:false,
        keyboard:false,
        wrap:false
	});
	$tarjetas.carousel('pause');
	$('.tarjeta').each(function(i,e){
		$(e).unbind().click(function(){
			var objetivo = $(e).attr('data-objetivo');
            console.log(objetivo);
			$tarjetas.carousel(parseInt(objetivo));
			$tarjetas.carousel('pause');
			$tarjetas.trigger({ type:"cambiaPagina",pagina: objetivo});
			$('#botonHome').click();
		});
	});
	
	$tarjetas.bind('cambiaPagina',function(ev){
        console.log("cambia pagina");
		$('.carousel-item').each(function(n,e){

			if(n==parseInt(ev.pagina)){
                
				var titulo = $(e).attr('data-title');
				$('span.app-brand-text').html(titulo);
				
			}
		});
	});
	 
	
	
	verificaLogin();
	login();
}


function leeArchivo(id){
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirEntry) {
		for(var a=1;a<=6;a++){
			var fileName = id+"_"+a+".txt";
			dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
				console.log(fileEntry); 
				//readFile(fileEntry)
				//writeFile(fileEntry, fileData,false);
			}, onErrorCreateFile);
		}
		
	}, onErrorLoadFs);
}
function login(){
	"use strict";
	if($('#loginBtn').length){
        
		$('#loginBtn').click(function(){
			if($('#usuario').val()==""){
				$('#mensaje').html("<div class='col-12 mb-3 alert alert-danger'><i class='fa fa-exclamation-triangle'></i> Debe ingresar el usuario para continuar</div>");
				return false;
			}
			if($('#contrasenia').val()==""){
				$('#mensaje').html("<div class='col-12 mb-3 alert alert-danger'><i class='fa fa-key'></i> Debe ingresar la contraseña para continuar</div>");
				return false;
			}
			
            var usuario     = $('#login input[name="usuario"]').val();
            var contrasenia = ($('#login input[name="contrasenia"]').val());
            if(usuario=="" || contrasenia==""){ notifica("Error","No debe dejar el usuario y/o contraseña vacios","error"); return false; }
            $('#mensaje').html("<div class='col-12 mb-3 alert alert-success'><i class='fa fa-sync fa-spin'></i> Consultando las credenciales.</div>");
			$.post(_DOMINIO_,{"acc":"Login","usuario":usuario,"contrasenia":contrasenia},
			  function (res) {
				  //if(debug==1){ notifica("respuesta",ob,"success");}
				  var ob = (res);
                
					$('#mensaje').html("<div class='col-12 mb-3 alert alert-"+ob.estado+"'><i class='fa fa-sync fa-spin'></i> "+ob.mensaje+"</div>");

					if(ob.estado=="success"){
                        window.localStorage.usuario = JSON.stringify(ob.usuario);
                        window.localStorage.llave = ob.usuario.llave;
						interfaz.abre();
                        interfaz.configuracion(ob);
						

					}else{
                        $('#mensaje').html("<div class='alert alert-danger'><i class='fa fa-exclamation-triangle'></i> "+ob.mensaje+"</div>");
                        interfaz.cierraSesion();
                    }
			 
			}).fail(function(){
				notifica("ERROR","Parece que hay un problema con la conexión al servidor","error");
			});
			
			
			
			
			
		});
	}
}
function permisos(){
	"use strict";
	PermissionScope.init({
  headerLabel: 'Hello',
  bodyLabel: 'Antes de continuar',
  closeButtonTextColor: '#cccccc',
  closeButtonTitle: 'Return',
  permissionButtonTextColor: '#30ab7d',
  permissionButtonBorderColor: '#30ab7d',
  closeOffset: '{-200, 0}',
  authorizedButtonColor: '#cccccc',
  unauthorizedButtonColor: '#c2262d',
  permissionButtonCornerRadius: '20',
  permissionLabelColor: '#ff5500',
  permissionButtonΒorderWidth: '5',
  deniedCancelActionTitle: 'Cancelar',
  deniedDefaultActionTitle: 'Opciones',
  deniedAlertTitle: 'Permission',
  deniedAlertMessage: 'Por favor active todos los servicios',
  disabledCancelActionTitle: 'Cancelar',
  disabledDefaultActionTitle: 'Opciones',
});

PermissionScope.addBluetoothPermission('Por favor active el permiso de acceso a Bluetooth');
PermissionScope.addCameraPermission('Por favor active el permiso para acceder a la cámara');
	PermissionScope.show();

}



function successCallback(){
	"use strict";
	notifica("PERMISO","Permiso concedido","success");
	
}
function errorCallback(){
	"use strict";
	notifica("PERMISO","no tiene permiso","error");
}

function verificaLogin(){
	"use strict";
	if(typeof window.localStorage.usuario !=='undefined'){
       
		interfaz.abre();
        interfaz.cargaDatos();
	}
}



function notifica (titulo,texto,tipo){
	"use strict";
		new PNotify({
            title: titulo,
            text: texto,
            type: tipo//, //success , info, notice, error,dark
           // styling: 'bootstrap3'
        });
}

function solicita(titulo,texto,titulo2,texto2,funcion,datos){
	"use strict";
	(new PNotify({
    title: titulo,
    text: texto,
    icon: 'fa fa-envelope',
    hide: false,
    confirm: {
        prompt: true
    },
    buttons: {
        closer: false,
        sticker: false
    },
    history: {
        history: false
    }
})).get().on('pnotify.confirm', function(e, notice, val) {
	funcion(datos,val);
	if(titulo2!="" || texto2!=""){
    notice.cancelRemove().update({
        title: titulo2,
        text: texto2+val,
        icon: false,
        type: 'info',
        hide: true,
        confirm: {
            prompt: false
        },
        buttons: {
            closer: true,
            sticker: true
        }
    });
	}
});/*.on('pnotify.cancel', function(e, notice) {
    notice.cancelRemove().update({
        title: 'You Don\'t Want a Side',
        text: 'No soup for you!',
        icon: true,
        type: 'info',
        hide: true,
        confirm: {
            prompt: false
        },
        buttons: {
            closer: true,
            sticker: true
        }
    });
});*/
}
function confirma(texto,si,no) {
	"use strict";
    new PNotify({
    title: 'Necesitamos que confirme:',
    text: texto,
    icon: 'glyphicon glyphicon-question-sign',
    hide: false,
    confirm: {
        confirm: true
    },
    buttons: {
        closer: false,
        sticker: false
    },
    history: {
        history: false
    }
	
}).get().on('pnotify.confirm', function() {
    if (typeof si !== "undefined") {
		si();
	}
}).on('pnotify.cancel', function() {
    if (typeof no !== "undefined") { 
		no();	
	}
});
}



function irTarjeta(i){
	"use strict";
	$tarjetas.carousel(i);
	$tarjetas.carousel('pause');
	$tarjetas.trigger({ type:"cambiaPagina",pagina: 6});
}


function initialize(){
	"use strict";
	var car = "M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z";
	 icono = {
	  path: car,
	  scale: .6,
	  strokeColor: 'white',
	  strokeWeight: .10,
	  fillOpacity: 1,
	  fillColor: '#404040',
	  offset: '5%',
	  // rotation: parseInt(heading[i]),
	  anchor: new google.maps.Point(10, 25) // orig 10,50 back of car, 10,0 front of car, 10,25 center of car
	};
	//http://maps.google.com/mapfiles/ms/icons/blue.png
	directionsService = new google.maps.DirectionsService();
	
	
	var div = document.getElementById("map_canvas");
	var chicago = new google.maps.LatLng('-2.161767777777778','-79.8392');
	
	
	var myOptions = {
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: chicago
    };
	map = new google.maps.Map(div, myOptions);
	//console.log("Get origen");
	getLocation();
	var rendererOptions = {
		//draggable:true,
    	map: map,
		preserveViewport: true,
		panel: document.getElementById('directions-panel'),
		suppressMarkers: true

	};
	
	directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
	directionsDisplay.addListener('directions_changed', function() {
		//calculateAndDisplayRoute({"lat":origen.lat,"lng":origen.lng},origen);
        //computeTotalDistance(directionsDisplay.getDirections());
    });
	$('#generarRuta').on("click",function(){
		calculateAndDisplayRoute(1);
		$.post(_DOMINIO_,{"acc":"sincronizar","tipo":"generarRuta","llave":$('#interaccion').attr('data-llave')},function(res){
			
		});
		irTarjeta(2);
	});
	
	//// PC
	//// MOBIL
		//var map = plugin.google.maps.Map.getMap(div);
	//// MOBIL
}
function degreesToRadians(degrees) {
  	"use strict";
	return degrees * Math.PI / 180;
}
function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  "use strict";
  var earthRadiusKm = 6371;
  var dLat = degreesToRadians(lat2-lat1);
  var dLon = degreesToRadians(lon2-lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return earthRadiusKm * c;
}
///// DATOS FICHA

function createFile(dirEntry, fileName, isAppend) {
    // Creates a new file or returns the file if it already exists.
    dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
 		console.log("Creando archivo");
        writeFile(fileEntry, null, isAppend);
 
    }, onErrorCreateFile);
 
}
function readFile(fileEntry) {
 
    fileEntry.file(function (file) {
        var reader = new FileReader();
 
        reader.onloadend = function() {
            console.log("Successful file read: " + this.result);
			
            //displayFileData(fileEntry.fullPath + ": " + this.result);
        };
 
        reader.readAsText(file);
 
    }, onErrorReadFile);
}
function writeFile(fileEntry, dataObj, isAppend) {
 
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {
 
        fileWriter.onwriteend = function() {
            console.log("Successful file write ");
			console.log(fileEntry);
          //  if (dataObj.type == "image/png") {
          //      readBinaryFile(fileEntry);
          //  }
          //  else {
               // readFile(fileEntry);
          //  }
        };
 
        fileWriter.onerror = function(e) {
            console.log("Failed file write: " + e.toString());
        };
        fileWriter.write(dataObj);
    });
}
function saveFile(dirEntry, fileData, fileName) {
 
    dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
        writeFile(fileEntry, fileData,false);
    }, onErrorCreateFile);
}
function onErrorReadFile(error){
	console.log("Read error:");
	console.log(error);
}
function onErrorCreateFile(error){
	console.log("Error ");
	console.log(error);
}
/* FN */
function leerCodigo(i){
    var objetivo = $(i).attr('data-objetivo');
    cordova.plugins.barcodeScanner.scan(
      function (result) {
          //alert(objetivo);
          $('input[name="'+(objetivo)+'"]').val(result.text).trigger('change');
          if(objetivo=="qr_busqueda")
          $('input[name="'+(objetivo)+'"]').val(result.text.split("::")[0]).trigger('keyup');
          
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
          //resultDisplayDuration: 5, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
          //formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
          orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
          disableAnimations : true, // iOS
          disableSuccessBeep: false // iOS and Android
      }
   );
}
/* FN */

window.onerror = function(error, url, line) {
    logErr(error); 
    console.log(error,"URL: ",url,"Line: ",line);
};

function logErr(error){
    console.log("Error",error);
    if(errList.indexOf(error.name)>=0){
       $.ajax({
             url: _DOMINIO_,
             async: true,
             type: "POST",
             "data":{
                "error": JSON.stringify(error)   
             },
             success: function() { console.log('error logged : ',error); }
       });
    }
}

function notificacionesPush(){
   
	try{
	
	cordova.plugins.firebase.messaging.getToken().then(function(token) {	
	   $.post(webservice,{"acc":"registra","regId":token,"device":JSON.stringify(device),"llave":window.localStorage.llave,"tipo":window.localStorage.tipo});
	});
	cordova.plugins.firebase.messaging.onMessage(function(payload) {
        //alert(payload.accion);
        
        if(payload.accion=="mensajeNuevo"){
            //alert(JSON.stringify(payload));
            cargaMensajeRemoto(payload.mensaje);
            sinFondo("",["","","<i class='fa fa-envelope text-warning'></i> Mensaje nuevo recibido",""]);
        }
        
        
    	/*swal({
				  title: ob.titulo,
				  text: ob.mensaje,
				  type: ob.estado,
				  showCancelButton: true,
				  cancelButtonText:"Cerrar",
				  confirmButtonClass: 'btn-success',
				  confirmButtonText: ob.confirmText,
				 // showLoaderOnConfirm: true,
				closeOnConfirm: false},
				function(isConfirm) {
				  if (isConfirm) window.location.href=ob.redirecciona;
				});*/
	});
	cordova.plugins.firebase.messaging.onBackgroundMessage(function(payload) {
        if(payload.accion=="mensajeNuevo"){
            //alert(JSON.stringify(payload));
            cargaMensajeRemoto(payload.mensaje);
            sinFondo("",["","","<i class='fa fa-envelope text-warning'></i> Mensaje nuevo recibido",""]);
        }
		//alert(JSON.stringify(payload));
	});
	cordova.plugins.firebase.messaging.requestPermission().then(function() {
    //zalert("Push messaging is allowed");
});
		cordova.plugins.firebase.messaging.subscribe("mensajeNuevo");
	/*const push = PushNotification.init({
	  android: {
		 // icon:'radio',
		 // iconColor:'red',
		 // vibrate:true
	  },
			browser: {
		pushServiceURL: 'http://push.api.phonegap.com/v1/push'
	  },
	  ios: {
		alert: 'true',
		badge: 'true',
		sound: 'true'
	  },
	});
	PushNotification.hasPermission(data => {
	  if (data.isEnabled) {

	  }else{

	  }
	});
	
	push.on('recibeDatos', data=>{
		$.post(dominio+"servicio",{"acc":"recibeDatos","datos":JSON.stringify(data)},function(res){
			var ob = $.parseJSON(res);
			if(ob.estado=="success"){
				alert(ob.mensaje);
			}
		});
	});	
	push.on('notification', data => {
		var icono = "";
		var boton = "";
		var funcion;
		var tipo = {};
	 	if(data.additionalData.foreground==false){
			if(data.additionalData.activa=="activa") cordova.plugins.backgroundMode.moveToForeground();
		}else{
			try{
				if(data.additionalData.tipo=="noticia"){ 
					noticiasListado(); 
					boton="Ver la noticia";  
					tipo.tipo        = "";
					tipo.cancelBtn   = true;
					tipo.cancelText  = "No visitar";
					tipo.confirmText = 'Ver la noticia';
					tipo.closeOnConfirm = false;

					alertaDulce(icono+data.title,data.message,tipo,function(){
						noticiaClick(parseInt(data.additionalData.noticia));  
					});	
				}else{	
					alertaDulce(icono+data.title,data.message,tipo,'');
				}	
			}catch(err){ 
				reportaError(err,0);
			}
		}	
	});			
	push.subscribe('saldo',() => {},e => {});
	push.subscribe('noticias',() => {},e => {});
	push.subscribe('avisos',() => {},e => {});
	push.on('error', e => {
	  //alert("Push Error"+e.message);
	});*/
	}catch(err){
		reportaError(err,0);
	}
}
function utf8_to_b64( str ) {
  return window.btoa(unescape(encodeURIComponent( str )));
}
function b64_to_utf8( str ) {
  return decodeURIComponent(escape(window.atob( str )));
}
