// JavaScript Document
 
class Camara {
    constructor(contenedorActual,contenedorFoto){
		let acciones = this;
        this.contenedorActual = contenedorActual;
        this.contenedorFoto = contenedorFoto;
        this.dimension = {ancho:1920,"alto":1080};
        $('body').append('<div id="'+contenedorFoto.replace('#',"")+'" class="d-none contenedorPreview">'+
            '<div class="lineas">'+
                '<div class="lsd"></div><div class="lsi"></div>'+             
                '<div class="lid"></div><div class="lii"></div>'+                      
            '</div>'+    
            '<div class="botones">'+
                '<a class="btn btn-warning mr-2 text-dark volverCamara"><i class="fa fa-arrow-left"></i></a>'+
                '<a class="btn btn-success CamaraTomarFoto"><i class="fa fa-camera"></i></a> '+
                //'<a class="btn btn-success CamaraFlash"><i class="fa fa-bolt"></i></a> '+
				'<input id="zoomSlider" type="range" min="0" max="20" step="0.1" value="1" />'+
            '</div>'+
            '</div>');
        //var detener = this.stopCamera;
        var cierra  = this; 
        $('.volverCamara').unbind().on("click",function(){
            cierra.cierraPerfil();
            cierra.stopCamera();
          //  detener();
        })
		document.getElementById('zoomSlider').addEventListener('input', function(event) {
			const zoomValue = parseFloat(event.target.value);
			acciones.setZoomLevel(zoomValue);
		});
    }
	setZoomLevel(zoomLevel) {
		CameraPreview.setZoom(zoomLevel, function() {
			console.log("Zoom configurado a:", zoomLevel);
		}, function(err) {
			console.error("Error al configurar el zoom:", err);
		});
	}
  startEncima(){
	 
  CameraPreview.startCamera({
	  x: 0, //((window.screen.width/2)-150)
	  y: 0, 
	  width: window.screen.width, 
	  height:window.screen.height, 
	  camera: CameraPreview.CAMERA_DIRECTION.BACK, 
	  tapPhoto: false, 
	  storeToFile: false,
	  previewDrag: false, 
	  toBack: false
  },function(){
	CameraPreview.setFlashMode(CameraPreview.FLASH_MODE.ON);

  },function(){

  });
  }

startDebajo(nro){
    var acciones = this;
    acciones.init();
  $('.CamaraTomarFoto').unbind().on("click",function(){
        acciones.fotoDirecto(nro);
    });
	$('.CamaraFlash').unbind().on("click",function(){
        CameraPreview.setFlashMode(CameraPreview.FLASH_MODE.ON);
    });

     $('.contenedorPreview').unbind().on("click",function(e){
        CameraPreview.tapToFocus(event.x, event.y);
    })
    
  CameraPreview.startCamera({
      x: 0, 
      y: 0, 
      width: window.screen.width, 
	  height:window.screen.height, 
      camera: CameraPreview.CAMERA_DIRECTION.BACK, 
      tapPhoto: false, 
      previewDrag: false, 
      storeToFile: false,
      toBack: true});
    
  }

  stopCamera(){
    this.cierraPerfil();
    CameraPreview.stopCamera(); 
    $('body').removeClass('tomaFoto');
  }
 
  takePicture(nro){
	CameraPreview.setFlashMode(CameraPreview.FLASH_MODE.ON);
		  CameraPreview.takePicture({
			  height:640,
			  width:480,
			  quality: 50
		  },function(imgData){s
			  
			  
    });
  }
  async galeriaFoto(contenedor){
	let acciones = this
	navigator.camera.getPicture(
        function(imageData) {
			try{
            let img = document.getElementById(contenedor);
			let visualiza = imageData.replace('data:image/jpeg;base64,','');
			visualiza = visualiza.replace('data:image/png;base64,','')
            img.src = "data:image/jpeg;base64," + visualiza;
			
			var d = new Date(),
			 n = d.getTime();
		  	 let newFileName = n+".txt";
			   $('#'+contenedor+'_imagen').val(newFileName);	  	
				let almacenamiento;
				almacenamiento = cordova.file.dataDirectory;  
					  acciones.savebase64AsImageFile(almacenamiento,newFileName,visualiza); 
				   }catch(e){
					   alert(e);
				   }
        },
        function(error) {
            console.error("Error al seleccionar la imagen:", error);
            alert("No se pudo seleccionar una imagen.");
        },
        {
            quality: 100, // Calidad de la imagen
            destinationType: Camera.DestinationType.DATA_URL, //  Base64
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY, // Seleccionar desde la galería
            allowEdit: false, // Permitir editar la imagen antes de seleccionarla
            correctOrientation: true // Corregir orientación automáticamente
        }
    );

  }
  async leerFoto(filename){
	  
	  return new Promise(resolve => {
	  let acciones = this;
	  try{
	  window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
		console.log("got main dir",dir);
		
		dir.getDirectory('fotos', { create: false, exclusive: false }, function(dirEntry){
			dirEntry.getFile(filename, {create:false,exclusive:false}, function(file) {
				//console.log("got the file", file);
				let valor = acciones.readFile(file);
				console.log("foto leida__");
				resolve(valor);
				
			},function(e){
				alert("Error al crear "+JSON.stringify(e));
			});
		}, function(e){
			
		});
		
		
	 });
	  }catch(e){
		  alert("error{}: "+e);
	  }
	  });
  }
  fotoDirecto(nro){
      var acciones = this;
	  let $scope = {};
	  $scope.images = [];
 	  $scope.image = null;
      CameraPreview.takeSnapshot({quality: 95}, function(base64PictureData){
		  	 var d = new Date(),
			 n = d.getTime();
			 let newFileName = n + ".txt";
    		 $(nro).attr('src','data:image/jpeg;base64,' + base64PictureData).addClass('border border-success');
		  	 $(nro+'_imagen').val(newFileName);
		  try{
		  	 
			 
             
		  	 
		  	
		  let almacenamiento;
		  //alert(navigator.platform);
		  almacenamiento = cordova.file.dataDirectory;
			  //almacenamiento = cordova.file.dataDirectory;
		  //alert(almacenamiento);
		  //alert("nombre: "+newFileName);
             
                 
                acciones.savebase64AsImageFile(almacenamiento,newFileName,base64PictureData);
				
             }catch(e){
                 alert(e);
             }
			  acciones.stopCamera();
      })
  }
  async b64toBlob(b64Data, contentType) {
    const base64Response = await fetch(b64Data);
    const blob = await base64Response.blob();
	  
	return blob;
  }
  writeFile(fileEntry, dataObj, isAppend) {
    // Create a FileWriter object for our FileEntry (log.txt).
	try{
    fileEntry.createWriter(function (fileWriter) {
		try{
        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
            //readFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
            alert("Failed file read: " + e.toString());
        };

        // If we are appending data to file, go to the end of the file.
		
        if (isAppend) {
			
            try {
				console.log("JSON",JSON.stringify(fileWriter));
                fileWriter.seek(fileWriter.length);
            }
            catch (e) {
                alert("file doesn't exist!");
            }
        }
        fileWriter.write(dataObj);
			
		}catch(e){
			alert("Error writeFile: "+e);
		}
    });
	}catch(e){
		alert("Error createwrite: "+e);
	}
  }
  readFile(fileEntry) {
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
  writeLog(str,logOb) {
	let acciones = this;
	if(!logOb) alert("Error");
	  
	try{
	var log = str + " [" + (new Date()) + "]\n";
	console.log("going to log "+log);
	logOb.createWriter(function(fileWriter) {
		fileWriter.seek(fileWriter.length);
		fileWriter.onwriteend = function() {
			acciones.readFile(logOb);	
		}
		var blob = new Blob([log], {type:'text/plain'});
		fileWriter.write(blob);
		console.log("ok, in theory i worked");
	}, function(e){
		alert("Error al escribir el archivo");
		
	});
	}catch(e){
		alert(e);
	}
  }
  
  savebase64AsImageFile(folderpath,filename,content){
	  try{
    var acciones = this;
   // var DataBlob = acciones.b64toBlob(content,contentType);
   
		  
		  
		  
	
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
		console.log("got main dir",dir);
		
		dir.getDirectory('fotos', { create: true, exclusive: false }, function(dirEntry){
			dirEntry.getFile(filename, {create:true,exclusive:false}, function(file) {
				//console.log("got the file", file);
				acciones.writeLog(content,file);			
			},function(e){
				alert("Error al crear");
			});
		}, function(e){
			
		});
		
		
	});
		  
    //alert("Starting to write the file :3");
   /*fetch(content).then( response => response.blob() ).then(
   blob =>{
		  
    window.resolveLocalFileSystemURL(folderpath, function(dir) {
		dir.getFile(filename, {create:true}, function(file) {
            //alert("File created succesfully.");
			let isAppend = true;
			
			acciones.writeFile(file, blob, isAppend);
			
		},function(e){
			alert(e);
		});
    });
	   
	   
	});*/
		  
	  }catch(e){
		  alert(e);
	  }
}
    

  
  
  cierraPerfil(){
      
      $(this.contenedorActual).removeClass('d-none');
      $(this.contenedorFoto).addClass('d-none');
      $('body').removeClass('tomaFoto');
  }
  show(){
    CameraPreview.show();
  }

  hide(){
    CameraPreview.hide();
  }
  showSupportedPictureSizes(){
      var dimensiones = [];
    CameraPreview.getSupportedPictureSizes(function(dimensions){
      //alert("IO");
      dimensions.forEach(function(dimension) {
        dimensiones.push({"ancho":dimension.width,"alto":dimension.height});
      });
      window.localStorage.camara_dimensiones = JSON.stringify(dimensiones);
    });
     
  }
    
  init(){
	"use strict";
      
	$(this.contenedorActual).addClass('d-none');
    $(this.contenedorFoto).removeClass('d-none');
    $('body').addClass('tomaFoto');
    /*$('.tomarFoto').each(function(i,e){
		
		//$(e).on("click",function(){
			//$('#controlesCamara').removeClass('oculta');
			//var foto = $(this).attr("data-foto");
			//$('#nFoto').html(foto);
			//Camara.startCameraBelow();	
		//});
	});
 	$('#tFoto').on("click",function(){	
		Camara.takePicture($('#nFoto').html());	
	});
	$('#cFoto').on("click",function(){
		Camara.stopCamera();
		$('#controlesCamara').addClass('oculta');
	});*/
	  
  }
};


