// JavaScript Document

var blCode =  "BDFB4EBC-CDAC-4CF4-8B3E-59EB041253D0";
var bleActual = "";
var conectado = false;
var comandos = "";
var funcionalidad = "llenaFicha";
var bleCom = {
   serviceUUID: "FFE0",
    txCharacteristic: "FFE1", // transmit is from the phone's perspective 0000FFE1-0000-1000-8000-00805F9B34FB
    rxCharacteristic: "FFE1"  // receive is from the phone's perspective
};


var app = {
    initialize: function() {
		app.setStatus("Inicializando");
		app.onDeviceReady();
        app.bindEvents();
        app.showMainPage();
		
    },
	
    bindEvents: function() {     
	//app.setStatus("Bind<br>");
        $('#relistar').on("click", app.refreshDeviceList);
//        disconnectButton.addEventListener(TOUCH_START, this.disconnect, false);
	//app.setStatus("Fin Bind<br>");
    },
    onDeviceReady: function() {
		app.setStatus('Cargando libreria<br>');
        app.refreshDeviceList();
		//app.botones();
    },
    refreshDeviceList: function() {
		$('#deviceList').html('');
		app.setStatus('Reescaneando');
		$('#message').html('');
        ble.scan([],10,app.onDeviceList, app.onError);
    },
    onDeviceList: function(device) {
		"use strict";
		if(device.id==blCode) {
			app.connect();
		}else{
			app.setStatus('Monstrando lista');
		$('#deviceList div').unbind();
		 $('#deviceList').append("<div data-id='"+device.id+"' class='col mb-2 border-bottom pb-2'><strong>"+device.name +"</strong>["+device.id+"]" +'</b><br/>' +
                '<i class="badge badge-success pt-1 pr-1 pl-1">RSSI: ' + device.rssi + '</i><br>'+"</div>");
			
			$("#deviceList div").each(function(i,e){
				var co = $(e);
				$(e).on("click",function(){
					alert(co.attr("data-id"));
					app.connect(co);
				});
			});
			
		}

    },
    connect: function(e) {
		"use strict";
		
		var deviceId = e.attr('data-id'),//blCode,//
          onConnect = function() {
                // subscribe for power consumption notifications
               // disconnectButton.dataset.deviceId = deviceId;
               // lightSwitch.dataset.deviceId = deviceId;
               // dimmer.dataset.deviceId = deviceId;
			   conectado = true;
			   
			ble.startNotification(deviceId, bleCom.serviceUUID, bleCom.rxCharacteristic, app.onData, app.onError);
			ble.stopScan(function(){
				app.setStatus("deteniendo escaneo<br>");
				$('#deviceList').html('');
			
			},function(){ app.setStatus("error deteniendo scaneo<br>"); });
			
			bleActual = deviceId;
		  
		   app.setStatus("Disp:"+deviceId);
		   $('#uid').html(deviceId);
           app.showDetailPage();
		   app.estado();
            };
        	ble.connect(deviceId, onConnect, app.onError);
			app.setStatus("Conectado<br>");
		
        
    },
	connectDirect: function(e) {
		$('#bateria').unbind();
		$('#lock').unbind();
		$('#lock2').unbind();
		
		$('.aUP').unbind();
		var deviceId = e,//blCode,,		
          onConnect = function() {
   		   conectado = true;
			ble.startNotification(deviceId, bleCom.serviceUUID, bleCom.rxCharacteristic, app.onData, app.onError);
			ble.stopScan(function(){ app.setStatus("deteniendo escaneo reconexion<br>"); },function(){ app.setStatus("error deteniendo scaneo<br>"); });

        ble.connect(deviceId, onConnect, app.onError);

		
		  };
    },
    onData: function(data) {
		var datos = bytesToString(data);
		var cuenta = datos.length;
		var nCon = datos.substr(0,4);
		console.log(nCon);
		if(nCon=="con:"){
			if(funcionalidad=="llenaFicha"){
				llenaFicha(datos.replace("con:",""));
			}
			if(funcionalidad=="obtieneUUID"){
				$('#cRFID').val(datos.replace("con:",""));
				$('.iconoRFID').attr("src","images/RFID_sensor_4050-encontrado.png");
				funcionalidad="llenaFicha";
			}
		}
		app.setStatus(datos);		
		
    },
	sendCommand: function(c){
		 var success = function() {
            app.setStatus("<br>Mensaje enviado "+c+"<br>");
	     };

        var failure = function() {
            app.setStatus("Fallo en el envio<br>");
			
        };

        var data = stringToBytes(c+"\n");
        var deviceId = $('#uid').html();
       ble.writeWithoutResponse(
            deviceId,
            bleCom.serviceUUID,
            bleCom.txCharacteristic,
            data, success, failure
        );
//		               JSON.stringify(new_tweets);

	},
    sendData: function(event) { // send data to Arduino
		
    },
    disconnect: function(event) {
        //bluetoothSerial.disconnect(app.showMainPage, app.onError);
    },
    showMainPage: function() {
	   
		app.setStatus("Show main<br>");
    },
    showDetailPage: function() {
	
        ///
		
    },
    setStatus: function(message) {
	    $('#message').append("<div>"+message+"</div>");
		//$('.statusMessage').html(message);	
    },
    onError: function(reason) {
	   app.setStatus("ERROR: " + reason+"<br/>"); // real apps should use notification.alert
    },
	estado: function(){
	
		//app.sendCommand("e");
	}	
};

function bytesToString(buffer) {
    
	return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
	
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}
