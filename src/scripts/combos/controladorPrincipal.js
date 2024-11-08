// Importando archivos
var $jq = require("jquery");
var $var = require("./variables");
  //console.log($var)
  var urlGet = new URL(window.location.href);
  var getZoomMapInvert = d3.scale.linear().domain([18, 0]).range([0, $(".ActionBar__list__item__scrollBar").height()]);
  function initGlobales() {
    // if(urlGet.search != "" && urlGet.searchParams.get("lt") != null && urlGet.searchParams.get("lg") != null && urlGet.searchParams.get("z") != null){      
    //   $var.Map.latInicial = parseFloat(urlGet.searchParams.get("lt"));
    //   $var.Map.lngInicial = parseFloat(urlGet.searchParams.get("lg"));
    //   $var.Map.zoomLevel = parseFloat(urlGet.searchParams.get("z"));
    // }
    Map();             
  }
  // Variables de inicio aplicación.
  setTimeout(function() {
    $( '#ActionBar__moveMap__btn' ).addClass('--active');

    $var.Map.mapWidth = document.getElementById( 'map' ).clientWidth;
    $var.Map.iconsLeftBar = document.getElementById( 'toolBar__container__buttons__list' ).clientWidth;
    $("#map__tinyMap__map > div > div > div:nth-child(3)").css("display", "none");
    $var.Map.screenCoord = 'Latitud: ' + $var.Map.latInicial + ' Longitud: ' + $var.Map.lngInicial;
    $('.map__coord__value').html($var.Map.screenCoord);

    $(".gm-svpc").parent().appendTo(".ActionBar__list");
    $(".gm-svpc").parent().css("position",'relative')
    $(".gm-svpc").parent().css("top",'0px')
    $(".gm-svpc").parent().css("right",'0px')
    $(".gm-svpc").parent().css("bottom",'0px')
    $(".gm-svpc").parent().css("margin",'')
  }, 3000);

  // function updateURLParameter(url, param, paramVal){
  //   var newAdditionalURL = "";
  //   var tempArray = url.split("?");
  //   var baseURL = tempArray[0];
  //   var additionalURL = tempArray[1];
  //   var temp = "";
  //   if (additionalURL) {
  //       tempArray = additionalURL.split("&");
  //       for (var i=0; i < tempArray.length; i++){
  //           if(tempArray[i].split('=')[0] != param){
  //               newAdditionalURL += temp + tempArray[i];
  //               temp = "&";
  //           }
  //       }
  //   }

  //   var rows_txt = temp + "" + param + "=" + paramVal;
  //   return baseURL + "?" + newAdditionalURL + rows_txt;
  // }


  function Map() {
      $var.Map.mapOptions = {
          center: {
              lat: $var.Map.latInicial,
              lng: $var.Map.lngInicial
          },
          zoom: $var.Map.zoomLevel,
          mapTypeControl: false,
          fullscreenControl: false,
          scaleControl: true,
          streetViewControl: true,
          zoomControl: false,
          draggable: true
      };    
      
    function initMap() {
        
        $( '.ActionBar__list__item__btn' ).removeClass("--active");
        $( '#ActionBar__moveMap__btn' ).addClass('--active');
        $( '#ActionBar__identify__btn' ).addClass('--active');
        
        // Inicializa mapa Principal 'map'
        $var.Map.map = new google.maps.Map(document.getElementById('map'), $var.Map.mapOptions);
        google.maps.event.addListener($var.Map.map, "mousemove", function (event){
            $var.Map.screenCoord = 
                'Latitud: ' + $var.Map.sixDecimal(event.latLng.lat()) +
                ' Longitud: ' + $var.Map.sixDecimal(event.latLng.lng());
            $( '.map__coord__value' ).html('');
            $( '.map__coord__value' ).append($var.Map.screenCoord);
            //valores.innerHTML = "Latitud: " +  MapUtil.DDtoDMS(posicion.lat(), "lat") + " - Longitud: " + MapUtil.DDtoDMS(posicion.lng(), "lng");          
        })

        google.maps.event.addListener($var.Map.map, "click", function (clickEvent){
          if($var.Map.activadoPoly){
            if ($var.Map.isClosed)
              return;
            var markerIndex = $var.Map.poly.getPath().length;
            if(markerIndex < 20){
              var isFirstMarker = markerIndex === 0;
              var image = {
                url: './src/images/marker.png',
                size: new google.maps.Size(8, 8),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(4, 4),
                scaledSize: new google.maps.Size(8, 8)
              };		
              var marker = new google.maps.Marker({
                map: $var.Map.map, 
                icon: image, 
                position: clickEvent.latLng, 
                draggable: true 
              });
              $var.Map.markers.push(marker);
              console.log(isFirstMarker);
              if (isFirstMarker) {
                google.maps.event.addListener(marker, 'click', function () {
                  if ($var.Map.isClosed)
                    return;
                  var path = $var.Map.poly.getPath();
                  $var.Map.poly.setMap(null);
                  $var.Map.poly = new google.maps.Polygon({
                    map: $var.Map.map,
                    path: path,
                    strokeColor: "#4dd1f2",
                    strokeOpacity: 1,
                    strokeWeight: 3,
                    fillColor: "#4dd1f2",
                    fillOpacity: 0.2
                  });
                  $var.Map.isClosed = true;
                });
              }
              google.maps.event.addListener(marker, 'drag', function (dragEvent) {
                $var.Map.poly.getPath().setAt(markerIndex, dragEvent.latLng);
              });
              
              google.maps.event.addListener(marker, 'dragend', function (dragEvent) {
                if(activado){
                  $("#loading").show();
                  realizarEstadisticas();
                }
              });
              
              /*google.maps.event.addListener(marker, 'rightclick',  function(e) {
                if(markerIndex != 0){
                  $var.Map.poly.getPath().removeAt(markerIndex);			
                  marker.setMap(null);	
                }
              });*/			
              $var.Map.poly.getPath().push(clickEvent.latLng);	
            }
          }        
        })

        var GrisMapTypeOptions = {
          getTileUrl: function (coord, zoom) {
              return "https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i" + zoom + "!2i" + coord.x + "!3i" + coord.y + "!4i256!2m3!1e0!2sm!3i458165170!3m14!2ses-ES!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy5lOmd8cC5jOiNmZmY1ZjVmNSxzLmU6bC5pfHAudjpvZmYscy5lOmwudC5mfHAuYzojZmY2MTYxNjEscy5lOmwudC5zfHAuYzojZmZmNWY1ZjUscy50OjIxfHMuZTpsLnQuZnxwLmM6I2ZmYmRiZGJkLHMudDoyfHMuZTpnfHAuYzojZmZlZWVlZWUscy50OjJ8cy5lOmwudC5mfHAuYzojZmY3NTc1NzUscy50OjQwfHMuZTpnfHAuYzojZmZlNWU1ZTUscy50OjQwfHMuZTpsLnQuZnxwLmM6I2ZmOWU5ZTllLHMudDozfHMuZTpnfHAuYzojZmZmZmZmZmYscy50OjUwfHMuZTpsLnQuZnxwLmM6I2ZmNzU3NTc1LHMudDo0OXxzLmU6Z3xwLmM6I2ZmZGFkYWRhLHMudDo0OXxzLmU6bC50LmZ8cC5jOiNmZjYxNjE2MSxzLnQ6NTF8cy5lOmwudC5mfHAuYzojZmY5ZTllOWUscy50OjY1fHMuZTpnfHAuYzojZmZlNWU1ZTUscy50OjY2fHMuZTpnfHAuYzojZmZlZWVlZWUscy50OjZ8cy5lOmd8cC5jOiNmZmM5YzljOSxzLnQ6NnxzLmU6bC50LmZ8cC5jOiNmZjllOWU5ZQ!4e0&token=32965";
              //!4i256!2m3!1e0!2sm!3i458165170!3m14!2ses-ES!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy5lOmd8cC5jOiNmZmY1ZjVmNSxzLmU6bC5pfHAudjpvZmYscy5lOmwudC5mfHAuYzojZmY2MTYxNjEscy5lOmwudC5zfHAuYzojZmZmNWY1ZjUscy50OjIxfHMuZTpsLnQuZnxwLmM6I2ZmYmRiZGJkLHMudDoyfHMuZTpnfHAuYzojZmZlZWVlZWUscy50OjJ8cy5lOmwudC5mfHAuYzojZmY3NTc1NzUscy50OjQwfHMuZTpnfHAuYzojZmZlNWU1ZTUscy50OjQwfHMuZTpsLnQuZnxwLmM6I2ZmOWU5ZTllLHMudDozfHMuZTpnfHAuYzojZmZmZmZmZmYscy50OjUwfHMuZTpsLnQuZnxwLmM6I2ZmNzU3NTc1LHMudDo0OXxzLmU6Z3xwLmM6I2ZmZGFkYWRhLHMudDo0OXxzLmU6bC50LmZ8cC5jOiNmZjYxNjE2MSxzLnQ6NTF8cy5lOmwudC5mfHAuYzojZmY5ZTllOWUscy50OjY1fHMuZTpnfHAuYzojZmZlNWU1ZTUscy50OjY2fHMuZTpnfHAuYzojZmZlZWVlZWUscy50OjZ8cy5lOmd8cC5jOiNmZmM5YzljOSxzLnQ6NnxzLmU6bC50LmZ8cC5jOiNmZjllOWU5ZQ!4e0&token=32965
          },
          tileSize: new google.maps.Size(256, 256),
          name: "Gris",
          maxZoom: 18
        };

        $var.Map.baseMaps.gris = new google.maps.ImageMapType(GrisMapTypeOptions);
        $var.Map.map.mapTypes.set('Gris', $var.Map.baseMaps.gris);
        $var.Map.map.setMapTypeId('Gris');

        var NocheMapTypeOptions = {
          getTileUrl: function (coord, zoom) {
              return "https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i" + zoom + "!2i" + coord.x + "!3i" + coord.y + "!4i256!2m3!1e0!2sm!3i490200282!3m17!2ses-ES!3sUS!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy5lOmd8cC5jOiNmZjIxMjEyMSxzLmU6bC5pfHAudjpvZmYscy5lOmwudC5mfHAuYzojZmY3NTc1NzUscy5lOmwudC5zfHAuYzojZmYyMTIxMjEscy50OjF8cy5lOmd8cC5jOiNmZjc1NzU3NSxzLnQ6MTd8cy5lOmwudC5mfHAuYzojZmY5ZTllOWUscy50OjIxfHAudjpvZmYscy50OjE5fHMuZTpsLnQuZnxwLmM6I2ZmYmRiZGJkLHMudDoyfHMuZTpsLnQuZnxwLmM6I2ZmNzU3NTc1LHMudDo0MHxzLmU6Z3xwLmM6I2ZmMTgxODE4LHMudDo0MHxzLmU6bC50LmZ8cC5jOiNmZjYxNjE2MSxzLnQ6NDB8cy5lOmwudC5zfHAuYzojZmYxYjFiMWIscy50OjN8cy5lOmcuZnxwLmM6I2ZmMmMyYzJjLHMudDozfHMuZTpsLnQuZnxwLmM6I2ZmOGE4YThhLHMudDo1MHxzLmU6Z3xwLmM6I2ZmMzczNzM3LHMudDo0OXxzLmU6Z3xwLmM6I2ZmM2MzYzNjLHMudDo3ODV8cy5lOmd8cC5jOiNmZjRlNGU0ZSxzLnQ6NTF8cy5lOmwudC5mfHAuYzojZmY2MTYxNjEscy50OjR8cy5lOmwudC5mfHAuYzojZmY3NTc1NzUscy50OjZ8cy5lOmd8cC5jOiNmZjAwMDAwMCxzLnQ6NnxzLmU6bC50LmZ8cC5jOiNmZjNkM2QzZA!4e0&key=AIzaSyDk4C4EBWgjuL1eBnJlu1J80WytEtSIags&token=30387";
          },
          tileSize: new google.maps.Size(256, 256),
          name: "Noche",
          maxZoom: 18
        };
        $var.Map.baseMaps.noche = new google.maps.ImageMapType(NocheMapTypeOptions);

        $var.Map.base3DMaps.gris = new maptalks.TileLayer("google",{
          urlTemplate:'https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i458165170!3m14!2ses-ES!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy5lOmd8cC5jOiNmZmY1ZjVmNSxzLmU6bC5pfHAudjpvZmYscy5lOmwudC5mfHAuYzojZmY2MTYxNjEscy5lOmwudC5zfHAuYzojZmZmNWY1ZjUscy50OjIxfHMuZTpsLnQuZnxwLmM6I2ZmYmRiZGJkLHMudDoyfHMuZTpnfHAuYzojZmZlZWVlZWUscy50OjJ8cy5lOmwudC5mfHAuYzojZmY3NTc1NzUscy50OjQwfHMuZTpnfHAuYzojZmZlNWU1ZTUscy50OjQwfHMuZTpsLnQuZnxwLmM6I2ZmOWU5ZTllLHMudDozfHMuZTpnfHAuYzojZmZmZmZmZmYscy50OjUwfHMuZTpsLnQuZnxwLmM6I2ZmNzU3NTc1LHMudDo0OXxzLmU6Z3xwLmM6I2ZmZGFkYWRhLHMudDo0OXxzLmU6bC50LmZ8cC5jOiNmZjYxNjE2MSxzLnQ6NTF8cy5lOmwudC5mfHAuYzojZmY5ZTllOWUscy50OjY1fHMuZTpnfHAuYzojZmZlNWU1ZTUscy50OjY2fHMuZTpnfHAuYzojZmZlZWVlZWUscy50OjZ8cy5lOmd8cC5jOiNmZmM5YzljOSxzLnQ6NnxzLmU6bC50LmZ8cC5jOiNmZjllOWU5ZQ!4e0&token=32965',
          attribution:'&copy; <a href="http://ditu.google.cn/">Google</a>'
      });

      
      $var.Map.base3DMaps.noche = new maptalks.TileLayer("google",{
        urlTemplate:'https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i490200282!3m17!2ses-ES!3sUS!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy5lOmd8cC5jOiNmZjIxMjEyMSxzLmU6bC5pfHAudjpvZmYscy5lOmwudC5mfHAuYzojZmY3NTc1NzUscy5lOmwudC5zfHAuYzojZmYyMTIxMjEscy50OjF8cy5lOmd8cC5jOiNmZjc1NzU3NSxzLnQ6MTd8cy5lOmwudC5mfHAuYzojZmY5ZTllOWUscy50OjIxfHAudjpvZmYscy50OjE5fHMuZTpsLnQuZnxwLmM6I2ZmYmRiZGJkLHMudDoyfHMuZTpsLnQuZnxwLmM6I2ZmNzU3NTc1LHMudDo0MHxzLmU6Z3xwLmM6I2ZmMTgxODE4LHMudDo0MHxzLmU6bC50LmZ8cC5jOiNmZjYxNjE2MSxzLnQ6NDB8cy5lOmwudC5zfHAuYzojZmYxYjFiMWIscy50OjN8cy5lOmcuZnxwLmM6I2ZmMmMyYzJjLHMudDozfHMuZTpsLnQuZnxwLmM6I2ZmOGE4YThhLHMudDo1MHxzLmU6Z3xwLmM6I2ZmMzczNzM3LHMudDo0OXxzLmU6Z3xwLmM6I2ZmM2MzYzNjLHMudDo3ODV8cy5lOmd8cC5jOiNmZjRlNGU0ZSxzLnQ6NTF8cy5lOmwudC5mfHAuYzojZmY2MTYxNjEscy50OjR8cy5lOmwudC5mfHAuYzojZmY3NTc1NzUscy50OjZ8cy5lOmd8cC5jOiNmZjAwMDAwMCxzLnQ6NnxzLmU6bC50LmZ8cC5jOiNmZjNkM2QzZA!4e0&key=AIzaSyDk4C4EBWgjuL1eBnJlu1J80WytEtSIags&token=30387',
        attribution:'&copy; <a href="http://ditu.google.cn/">Google</a>'
    });

        // Inicializa mapa Minimapa 'tinymap'
        $var.Map.tinymap = new google.maps.Map(document.getElementById('map__tinyMap__map'), {
            center: {
                lat: $var.Map.latInicial,
                lng: $var.Map.lngInicial
            },
            mapTypeId: 'terrain',
            draggable: false,
            zoom: ($var.Map.zoomLevel - 5),
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            zoomControl: false,
            styles: [
                {
                  "elementType": "geometry",
                  "stylers": [
                    {
                      "color": "#f5f5f5"
                    }
                  ]
                },
                {
                  "elementType": "labels.icon",
                  "stylers": [
                    {
                      "visibility": "off"
                    }
                  ]
                },
                {
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                      "color": "#616161"
                    }
                  ]
                },
                {
                  "elementType": "labels.text.stroke",
                  "stylers": [
                    {
                      "color": "#f5f5f5"
                    }
                  ]
                },
                {
                  "featureType": "administrative.land_parcel",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                      "color": "#bdbdbd"
                    }
                  ]
                },
                {
                  "featureType": "poi",
                  "elementType": "geometry",
                  "stylers": [
                    {
                      "color": "#eeeeee"
                    }
                  ]
                },
                {
                  "featureType": "poi",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                      "color": "#757575"
                    }
                  ]
                },
                {
                  "featureType": "poi.park",
                  "elementType": "geometry",
                  "stylers": [
                    {
                      "color": "#e5e5e5"
                    }
                  ]
                },
                {
                  "featureType": "poi.park",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                      "color": "#9e9e9e"
                    }
                  ]
                },
                {
                  "featureType": "road",
                  "elementType": "geometry",
                  "stylers": [
                    {
                      "color": "#ffffff"
                    }
                  ]
                },
                {
                  "featureType": "road.arterial",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                      "color": "#757575"
                    }
                  ]
                },
                {
                  "featureType": "road.highway",
                  "elementType": "geometry",
                  "stylers": [
                    {
                      "color": "#dadada"
                    }
                  ]
                },
                {
                  "featureType": "road.highway",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                      "color": "#616161"
                    }
                  ]
                },
                {
                  "featureType": "road.local",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                      "color": "#9e9e9e"
                    }
                  ]
                },
                {
                  "featureType": "transit.line",
                  "elementType": "geometry",
                  "stylers": [
                    {
                      "color": "#e5e5e5"
                    }
                  ]
                },
                {
                  "featureType": "transit.station",
                  "elementType": "geometry",
                  "stylers": [
                    {
                      "color": "#eeeeee"
                    }
                  ]
                },
                {
                  "featureType": "water",
                  "elementType": "geometry",
                  "stylers": [
                    {
                      "color": "#c9c9c9"
                    }
                  ]
                },
                {
                  "featureType": "water",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                      "color": "#9e9e9e"
                    }
                  ]
                }
              ]        
        });
        // Inicializa mapa deslizante 'slidemap'
        $var.Map.slidemap = new google.maps.Map(document.getElementById('slidemap__content'), {
            center: {
                lat: $var.Map.latInicial,
                lng: $var.Map.lngInicial
            },
            mapTypeId: 'satellite',
            draggable: true,
            zoom: $var.Map.zoomLevel,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            zoomControl: false
        });
        // Inicializa multiples mapas 'multimap'
        $var.Map.multimap = new google.maps.Map(document.getElementById('multimap__content'), {
          center: {
              lat: $var.Map.latInicial,
              lng: $var.Map.lngInicial
          },
          mapTypeId: 'hybrid',
          draggable: true,
          zoom: ($var.Map.zoomLevel),
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: false
        });

        $var.Map.panorama = $var.Map.map.getStreetView();

        // Inicializa multiples mapas 'multimap2'
        $var.Map.multimap2 = new google.maps.Map(document.getElementById('multimap__content2'), {
          center: {
              lat: $var.Map.latInicial,
              lng: $var.Map.lngInicial
          },
          styles: $var.Map.multimapStyle,
          draggable: true,
          zoom: ($var.Map.zoomLevel),
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: false
      
        });
        // Inicializa mapa 3D
        //console.log($var.Map.map3D)
        if($var.Map.map3D == null){
          $(".map__box05").addClass("--active");

            var center = [$var.Map.lngInicial, $var.Map.latInicial];
            $var.Map.map3D = new maptalks.Map('map3D', {
              center: center,
              zoom: $var.Map.zoomLevel,
              pitch : 56,
              baseLayer: new maptalks.TileLayer("google",{
                  urlTemplate:'https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i458165170!3m14!2ses-ES!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy5lOmd8cC5jOiNmZmY1ZjVmNSxzLmU6bC5pfHAudjpvZmYscy5lOmwudC5mfHAuYzojZmY2MTYxNjEscy5lOmwudC5zfHAuYzojZmZmNWY1ZjUscy50OjIxfHMuZTpsLnQuZnxwLmM6I2ZmYmRiZGJkLHMudDoyfHMuZTpnfHAuYzojZmZlZWVlZWUscy50OjJ8cy5lOmwudC5mfHAuYzojZmY3NTc1NzUscy50OjQwfHMuZTpnfHAuYzojZmZlNWU1ZTUscy50OjQwfHMuZTpsLnQuZnxwLmM6I2ZmOWU5ZTllLHMudDozfHMuZTpnfHAuYzojZmZmZmZmZmYscy50OjUwfHMuZTpsLnQuZnxwLmM6I2ZmNzU3NTc1LHMudDo0OXxzLmU6Z3xwLmM6I2ZmZGFkYWRhLHMudDo0OXxzLmU6bC50LmZ8cC5jOiNmZjYxNjE2MSxzLnQ6NTF8cy5lOmwudC5mfHAuYzojZmY5ZTllOWUscy50OjY1fHMuZTpnfHAuYzojZmZlNWU1ZTUscy50OjY2fHMuZTpnfHAuYzojZmZlZWVlZWUscy50OjZ8cy5lOmd8cC5jOiNmZmM5YzljOSxzLnQ6NnxzLmU6bC50LmZ8cC5jOiNmZjllOWU5ZQ!4e0&token=32965',
                  attribution:'&copy; <a href="http://ditu.google.cn/">Google</a>'
              })            
            })
            $(".map__box05").removeClass("--active");
        }
      
        
        // Evento - Detecta el cambio del centroide de la posición del mapa principal
        $var.Map.map.addListener( 'center_changed', function () {            
            $var.Map.tinymap.setCenter($var.Map.map.getCenter());
            $var.Map.slidemap.setCenter($var.Map.map.getCenter());
            
            if(!$(".map__box05").hasClass("--active")){
              $var.Map.map3D.setCenter({x: $var.Map.map.getCenter().lng(), y: $var.Map.map.getCenter().lat()})
              $var.Map.map3D.setZoom(9);
            }  
          });
        // Evento - Detecta soltar arrastre del mapa principal y centra el deslizante 'slidemap'
        $var.Map.map.addListener( 'dragend', function () {
          $var.Map.slidemap.setCenter($var.Map.map.getCenter());
          $var.Map.multimap.setCenter($var.Map.map.getCenter());
          $var.Map.multimap2.setCenter($var.Map.map.getCenter());

          setTimeout(function () {
            // $(".gm-svpc").parent().css("position",'relative')
            // $(".gm-svpc").parent().css("right",'')
            // $(".gm-svpc").parent().css("bottom",'')
            // $(".gm-svpc").parent().css("margin",'') 
        }, 100);
        });
        
        // Evento - Detecta el arrastre del mapa principal y centra el deslizante 'slidemap'
        $var.Map.map.addListener( 'drag', function () {
          $var.Map.slidemap.setCenter($var.Map.map.getCenter());
          $var.Map.multimap.setCenter($var.Map.map.getCenter());
          $var.Map.multimap2.setCenter($var.Map.map.getCenter());
          });
        
        // Evento - Detecta soltar arrastre del mapa deslizante y centra el mapa principal 'map'
        $var.Map.slidemap.addListener( 'dragend', function () {
          $var.Map.map.setCenter($var.Map.slidemap.getCenter());
          $var.Map.multimap.setCenter($var.Map.slidemap.getCenter());
          $var.Map.multimap2.setCenter($var.Map.slidemap.getCenter());
        });
          // Evento - Detecta el arrastre del mapa deslizante y centra el mapa principal 'map'
        $var.Map.slidemap.addListener( 'drag', function () {
            $var.Map.map.setCenter($var.Map.slidemap.getCenter());
            $var.Map.multimap.setCenter($var.Map.slidemap.getCenter());
            $var.Map.multimap2.setCenter($var.Map.slidemap.getCenter());
        });
        // Evento - Detecta cambio de Zoom en Mapa
        $var.Map.map.addListener( 'zoom_changed', function () {
            $var.Map.tinymap.setZoom( $var.Map.map.getZoom() - 5);
            $var.Map.slidemap.setZoom( $var.Map.map.getZoom());
            $var.Map.multimap.setZoom($var.Map.map.getZoom());
            $var.Map.multimap2.setZoom($var.Map.map.getZoom());
            $(".ActionBar__ZoomBar__arrow").css("top", getZoomMapInvert($var.Map.map.getZoom()) + "px");
        });

        // Evento - Detecta el arrastre del  multimap y centra los demás mapas
        $var.Map.multimap.addListener( 'drag', function () {
          $var.Map.map.setCenter($var.Map.multimap.getCenter());
          $var.Map.slidemap.setCenter($var.Map.multimap.getCenter());
          $var.Map.multimap2.setCenter($var.Map.multimap.getCenter());
        });
        // Evento - Detecta la acción soltar arrastre del multimap y centra los demás
        $var.Map.multimap.addListener( 'dragend', function () {
          $var.Map.map.setCenter($var.Map.multimap.getCenter());
          $var.Map.slidemap.setCenter($var.Map.multimap.getCenter());
          $var.Map.multimap2.setCenter($var.Map.multimap.getCenter());
        });
        // Evento - Detecta el arrastre del  multimap2 y centra los demás mapas
        $var.Map.multimap2.addListener( 'drag', function () {
          $var.Map.map.setCenter($var.Map.multimap2.getCenter());
          $var.Map.slidemap.setCenter($var.Map.multimap2.getCenter());
          $var.Map.multimap.setCenter($var.Map.multimap2.getCenter());
        });
        // Evento - Detecta la acción soltar arrastre del multimap2 y centra los demás mapas
        $var.Map.multimap2.addListener( 'dragend', function () {
          $var.Map.map.setCenter($var.Map.multimap2.getCenter());
          $var.Map.slidemap.setCenter($var.Map.multimap2.getCenter());
          $var.Map.multimap.setCenter($var.Map.multimap2.getCenter());
        });
      // Función - Cambio de posición de la pantalla para obtener los limites
        $var.Map.map.addListener( 'bounds_changed', function () {
          $var.Map.bounds.east = $var.Map.map.getBounds().getNorthEast().lng();
          $var.Map.bounds.north = $var.Map.map.getBounds().getNorthEast().lat();
          $var.Map.bounds.west = $var.Map.map.getBounds().getSouthWest().lng();
          $var.Map.bounds.south = $var.Map.map.getBounds().getSouthWest().lat();

          
          //window.history.replaceState('', '', updateURLParameter(window.location.href, 'lt', $var.Map.map.getCenter().lat()));
          //window.history.replaceState('', '', updateURLParameter(window.location.href, 'lg', $var.Map.map.getCenter().lng()));
          //window.history.replaceState('', '', updateURLParameter(window.location.href, 'z', $var.Map.map.getZoom()));

          // Get the current bounds, which reflect the bounds before the zoom.
          $var.Map.tinymapRectangle.setMap(null);
          $var.Map.tinymapRectangle.setOptions({
              strokeColor: '#631028',
              strokeWeight: 2,
              fillOpacity: 0.1,
              map: $var.Map.tinymap,
              bounds: $var.Map.map.getBounds()
          });

          setTimeout(function () {
            if($(".--uploadLayer .toolBar__Container__panel__functionBox__checkList__item__slideTrans__scrollBtn").parent()[0] != undefined){
              var minLeft = $(".--uploadLayer .toolBar__Container__panel__functionBox__checkList__item__slideTrans__scrollBtn").parent()[0].getBoundingClientRect().left;
              newLeft = $(".--uploadLayer .toolBar__Container__panel__functionBox__checkList__item__slideTrans__scrollBtn")[0].getBoundingClientRect().left - minLeft;
              var percentage = newLeft/$(".--uploadLayer .toolBar__Container__panel__functionBox__checkList__item__slideTrans__scrollBtn").parent().width();
              percentage = 1 - percentage;
              $("#map").find("img[src*='kml']").css("opacity", percentage);
            }
          }, 500);
          // console.log(rectangle);
        });
        
        // Función - Cambio de posición en el mapa 3D
        $var.Map.map3D.on('moveend', function (e) {
          if($(".map__box05").hasClass("--active")){
            $var.Map.map.setCenter(new google.maps.LatLng($var.Map.map3D.getCenter().y,$var.Map.map3D.getCenter().x));            
            $var.Map.map.setZoom( $var.Map.map3D.getZoom());
          }          
        });
        
        // Función - Centrar Mapa
        $var.Map.centrarMapa = function () {
          $var.Map.map.setZoom($var.Map.zoomLevel);
          $var.Map.map.setCenter(
              new google.maps.LatLng(
                  $var.Map.latInicial, 
                  $var.Map.lngInicial
              ));                
          $(".ActionBar__ZoomBar__arrow").css("top", getZoomMapInvert($var.Map.zoomLevel) + "px");
          //console.log(Math.round(Math.abs((zoomLevel * 3.6) - 74)) + "px");
        }
        
        // Capa para cargar la versión del MGN 2005
        $var.Map.layers.mgn2005 = new google.maps.Data();
        $var.Map.layers.mgn2005.setMap($var.Map.map);

        // Capa para cargar la versión del MGN 2012
        $var.Map.layers.mgn2012 = new google.maps.Data();
        $var.Map.layers.mgn2012.setMap($var.Map.map);

        // Capa para cargar la versión del MGN 2017
        $var.Map.layers.mgn2017 = new google.maps.Data();
        $var.Map.layers.mgn2017.setMap($var.Map.map);
      
        // Capa para cargar los consejos
        $var.Map.layers.consejos = new google.maps.Data({
          clickable: true,
          zIndex: 2
        });
        $var.Map.layers.consejos.setMap($var.Map.map);

        // Capa para cargar las zonas campesinas
        $var.Map.layers.campesinos = new google.maps.Data({
          clickable: true,
          zIndex: 2
        });
        $var.Map.layers.campesinos.setMap($var.Map.map);
        // Capa para cargar los datos a mostrar
        $var.Map.layers.layerDatos = new google.maps.Data({
          clickable: $var.Map.clickableLayer,
          zIndex: 10,
          cursor: 'default'
        });

        $var.Map.layers.base_dptos = new google.maps.Data();
        $var.Map.layers.base_dptos.setMap($var.Map.map);
        
        // Capa para cargar la versión del MGN 2017
        $var.Map.layers.veredas = new google.maps.Data();
        $var.Map.layers.veredas.setMap($var.Map.map);

        $var.Map.layers.layerDatos.setMap($var.Map.map);

        //Cargar KML layer
        $var.Map.layers.kmlLayer = new google.maps.KmlLayer();
        $var.Map.layers.kmlLayer.setMap($var.Map.map);

        //Cargar InfoWindow para la información sobre el Mapa
        $var.Map.infoWindow = new google.maps.InfoWindow();
        $var.Map.infoWindow.setMap($var.Map.map);
        
        $var.Map.panorama = $var.Map.map.getStreetView();

        google.maps.event.addListener($var.Map.panorama, 'visible_changed', function() {
            if ($var.Map.panorama.getVisible()) {
                $(".map__close_street").show()
            } 
            else {
                $(".map__close_street").hide()
            }
        });

        // Instanciando y restringiendo el servicio de búsqueda de Google para Colombia
        var input = document.getElementById('functionAnalysis__btnFiltrar')
        var autocomplete = new google.maps.places.Autocomplete(input, {
            componentRestrictions: { country: 'co' }
        });
        autocomplete.bindTo('bounds', $var.Map.map);
        // Evento - Detecta cuando se selecciona un elemento sugerido en las búsquedas
        autocomplete.addListener('place_changed', function () {
            $var.Map.zoomToArea();
        });

        // call zoom control
        ZoomControl($var.Map.map);

         //Función - Busca ubicación/dirección y centra en el Mapa
         $var.Map.zoomToArea = function zoomToArea() {
          var address = document.getElementById('functionAnalysis__btnFiltrar').value;
          var infowindow = new google.maps.InfoWindow;
          geocoder = new google.maps.Geocoder();
          $( '.functionAnalysis__SearchBox__errorMessage' ).removeClass('--visible');
          if (address === '') {
              $( '.functionAnalysis__SearchBox__errorMessage' ).addClass('--visible');
              $('.functionAnalysis__SearchBox__errorMessage').html('');
              $('.functionAnalysis__SearchBox__errorMessage').append('Debes ingresar una ubicación o dirección.');
          } else {
              $(".toolBar__SearchBox").addClass('--erase')
              $( '.functionAnalysis__step03' ).removeClass('--invisible');
              geocoder.geocode(
                  {
                      address: address,
                      //Búsquedas únicamente sobre colombia {country: 'co'}
                      componentRestrictions: { country: 'co' }
                  },
                  function (results, status) {
                      if (status == google.maps.GeocoderStatus.OK) {
                          if ($var.Map.visualMarkers.length > 0) {
                              $var.Map.delVisualMarkers($var.Map.visualMarkers);
                              $var.Map.visualMarkers = [];
                              $var.Map.circuloAnalisis.setMap(null);	
                          }
                          var marker = new google.maps.Marker({
                              position: results[0].geometry.location,
                              icon: $var.Map.daneMarker,
                              map: $var.Map.map,
                              draggable: true
                          });
                          $var.Map.visualMarkers.push(marker);
                          $var.Map.map.setCenter(results[0].geometry.location);
                          $var.Map.map.setZoom(13);

                          google.maps.event.addListener(marker, "dragend", function(e) {
                              // c("slslsls")
                              $var.Map.circuloAnalisis.setCenter(e.latLng);
                          })
                          if(!$var.Map.activadoPoly && $("#functionAnalysis__location").hasClass("--active")){
                            $var.Map.circuloAnalisis = new google.maps.Circle({
                                strokeColor: "#4dd1f2",
                                strokeOpacity: 1,
                                strokeWeight: 2,
                                fillColor: "#4dd1f2",
                                fillOpacity: 0.2,
                                clickable: false,
                                radius: $var.Map.radius,
                                center: $var.Map.map.getCenter()
                            })        
                            $var.Map.circuloAnalisis.setMap($var.Map.map);
                          }
                          
                      } else {
                          $( '.functionAnalysis__SearchBox__errorMessage' ).addClass('--visible');
                          $('.functionAnalysis__SearchBox__errorMessage').html('');
                          $('.functionAnalysis__SearchBox__errorMessage').append(
                          'No podemos encontrar la localización, por favor intenta con un lugar más específico (Búsquedas restringidas sólo para Colombia).'
                          );
                      }
                      //console.log('FormatDdress: ' + results[0].formatted_address +'\nLocation: ' + results[0].geometry.location);
                  }
              )
          }
          // console.log('Búsqueda: ' + address);
        }
        
        // Zoom control function
        function ZoomControl ( map ) {
            var zoomIn = document.getElementById('ActionBar__Plus__btn');
            var zoomOut = document.getElementById('ActionBar__Minus__btn');
            
            google.maps.event.addDomListener(zoomOut, 'click', function() {
                var zoomLevel = map.getZoom();
                if(zoomLevel >= 0){
                  map.setZoom(zoomLevel - 1);
                  $(".ActionBar__ZoomBar__arrow").css("top", getZoomMapInvert(zoomLevel - 1) + "px");            
                }     
            });
            google.maps.event.addDomListener(zoomIn, 'click', function() {
                var zoomLevel = map.getZoom(); 
                if(zoomLevel < 22){
                  map.setZoom(zoomLevel + 1);
                  $(".ActionBar__ZoomBar__arrow").css("top", getZoomMapInvert(zoomLevel + 1) + "px");            
                }
            });
        }

        // Función - Activa/Desactiva Street View
        $var.Map.streetView = function () {
          if ($('#ActionBar__StreetView__btn').hasClass('--active') == false) {
              var streetViewLayer = new google.maps.StreetViewCoverageLayer();
              var streetViewService = new google.maps.StreetViewService();
              var radius = 1000;

              $('#ActionBar__StreetView__btn').addClass("--active");
              
              $var.Map.map.setOptions({ draggableCursor: 'default' });
              streetViewLayer.setMap($var.Map.map);
              
              // Evento - Detecta cada clic sobre el 'map' principal
              $var.Map.map.addListener('click', function (eClick) {
                  streetViewService.getPanoramaByLocation(eClick.latLng, radius, getStreetView);
                  function getStreetView(data, status) {
                      if (status == google.maps.StreetViewStatus.OK) {
                          map = new google.maps.Map(document.getElementById('map__tinyMap__map'), {
                              center: data.location.latLng,
                              zoom: $var.Map.zoomLevel,
                              mapTypeControl: false,
                              fullscreenControl: false,
                              zoomControl: false
                          });
                          var panorama = new google.maps.StreetViewPanorama(
                              document.getElementById('map'), {
                                  position: data.location.latLng,
                                  pov: {
                                      heading: 34,
                                      pitch: 10
                                  }
                              });
                              map.setStreetView(panorama);
                          } else {
                              window.alert(
                                  'Street View data not found for this location.\nStreet View no encontrado para esta localización.'
                                  )
                              }
                          }
                      });
          } else if ($('#ActionBar__StreetView__btn').hasClass('--active') == true) {
              $('#ActionBar__StreetView__btn').removeClass("--active");
              initMap();
          }
        }

        // Función - Activa/Desactiva opción de arrastrar mapa
        $var.Map.draggable = function () {
          var status = $( '#ActionBar__moveMap__btn' ).hasClass('--active');
          if ( status == true) {
              $('#ActionBar__moveMap__btn').removeClass("--active");
              $var.Map.map.setOptions({ draggable: false });
              $var.Map.map.setOptions({ draggableCursor: 'default' });
          } else {
              $('#ActionBar__moveMap__btn').addClass('--active');
              $var.Map.map.setOptions({ draggable: true });
              $var.Map.map.setOptions({ draggableCursor: 'grab' });
        }
          //console.log($var.Map.mapOptions.draggable);

        }

        // Función - Zoom a partir de un rectángulo manual sobre el mapa
        $var.Map.zoomRectangle = function () {

              // Initialize the drawing manager.
              var rectangle = new google.maps.drawing.DrawingManager({
                  drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
                  drawingControl: true,
                  drawingControlOptions: {
                      position: google.maps.ControlPosition.TOP_LEFT,
                      drawingModes: [
                      google.maps.drawing.OverlayType.RECTANGLE
                  ]},
                  // Propiedades de color del rectángulo
                  rectangleOptions: {
                      strokeColor: '#631028',
                      strokeWeight: 2,
                      fillColor: '#880e4f',
                      fillOpacity: 0.3
                  }
              });

              // Valida si el botón rectángulo está activo para edición
              if ($( '.ActionBar__RectangleZoom__btn' ).hasClass( '--active' ) == false ) {
                  $( '.ActionBar__RectangleZoom__btn' ).addClass('--active');
                  rectangle.setMap($var.Map.map);
              }

            // Una vez finaliza el rectángulo, hace el zoom y centra el mapa sobre el mismo
            rectangle.addListener( 'overlaycomplete', function (event) {
                $( '.ActionBar__RectangleZoom__btn' ).removeClass("--active");
                rectangle.setDrawingMode(null);
                var southWest = new google.maps.LatLng(
                    event.overlay.bounds.getSouthWest().lat(),
                    event.overlay.bounds.getSouthWest().lng()
                );
                var northEast = new google.maps.LatLng(
                    event.overlay.bounds.getNorthEast().lat(),
                    event.overlay.bounds.getNorthEast().lng()
                );
                var bounds = new google.maps.LatLngBounds(southWest, northEast);
                $var.Map.map.setCenter(bounds.getCenter());
                $var.Map.map.setZoom($var.Map.zoomScale(southWest,northEast));
                event.overlay.setMap(null) // Commente esta línea para validación del zoom
                console.log(event);
            });
        }
        
        // Función - Slide. Coloca un mapa para comparar información Geográfica
        $var.Map.slideScreen = function () {

          // Valida y activa los botones del Mapa
          if ($( '#ActionBar__Slide__btn' ).hasClass( '--active' ) == false ) {

              if($('#ActionBar__Views__btn').hasClass('--active')){
                $var.Map.multipleScreen()
              }

              // Inicializa variables al momento de lanzar el mapa deslizante
              document.getElementById("slidemap__content").style.width = $var.Map.mapWidth + "px";

              // Acciones visuales en el mapa
              $( '.map' ).addClass( '--collapseLeft --collapseRight' );
              $( '#ActionBar__Slide__btn' ).addClass('--active');
              $( '.ActionBar' ).addClass( '--collapseRight' );
              $( '.toolBar' ).addClass( '--collapse' );
              $( '.results' ).addClass( '--collapse' );
              $( '.map__box02' ).addClass('--active');

              // Eventos - Detecta los cambios sobre el div de borde y llama la función resize()
              var resize_el = document.getElementById('bordermap');
              resize_el.addEventListener('mousedown', function(e){
                  m_pos = e.x;
                  document.addEventListener('mousemove', resize, false);
              }, false);
              document.addEventListener('mouseup', function(){
                  document.removeEventListener('mousemove', resize, false);
              }, false);
              
              // Función - Recibe la posición del ancho del borde del mapa y redimensiona la misma.
              function resize(e){
                var parent = resize_el.parentNode;
                var mapWidth = $var.Map.mapWidth;
                m_pos = e.x;
                // Limita el desplazamiento del borde de la función deslizar derecha/izquierda
                if (m_pos > mapWidth) { m_pos = mapWidth; }
                if (m_pos < $var.Map.iconsLeftBar) { m_pos = ($var.Map.iconsLeftBar + 4); }
                parent.style.width = m_pos + "px";
                document.getElementById("map__box02").style.width = m_pos + "px";
                // console.log(mapWidth);
                }

          } else {
              $( '.map__box02' ).removeClass('--active');
              $( '#ActionBar__Slide__btn' ).removeClass('--active');
          }
        }

        // Función - Multiple. Lanza multiples ventanas para comparar información
        $var.Map.multipleScreen = function () {

          // Captura el ancho y alto del mapa principal
          $var.Map.mapWidth = document.getElementById('map').clientWidth;
          $var.Map.mapHeight = document.getElementById('map').clientHeight;

          if ($('#ActionBar__Views__btn').hasClass('--active') == false) {

              if($('#ActionBar__Slide__btn').hasClass('--active')){
                $var.Map.slideScreen()
              }

              $('#ActionBar__Views__btn').addClass('--active');
              $('.map__multipleViews').addClass('--active');
              // $('.toolBar').addClass('--collapse');
              
              // Eventos - Detecta los cambios sobre el div de borde y llama la función resize()
              var resize_el = document.getElementById('leftbordermap');
              resize_el.addEventListener('mousedown', function (e) {
                  w_pos = e.x;
                  h_pos = e.y;
                  document.addEventListener('mousemove', resize, false);
              }, false);
              document.addEventListener('mouseup', function () {
                  document.removeEventListener('mousemove', resize, false);
              }, false);

              // Función - Recibe la posición del ancho del borde del mapa y redimensiona la misma.
              function resize(e) {
                  w_pos = e.x;
                  h_pos = e.y - 83;
                  // Limita el desplazamiento del borde de la función deslizar derecha/izquierda
                  if (w_pos > $var.Map.mapWidth) { w_pos = $var.Map.mapWidth; }
                  if (w_pos < $var.Map.iconsLeftBar) { w_pos = ($var.Map.iconsLeftBar); }
                  if (h_pos > $var.Map.mapHeight) { h_pos = $var.Map.mapHeight -4; }
                  //if (h_pos < 86) { h_pos = h_pos + 100; }
                  document.getElementById("multipleviews").style.width = $var.Map.mapWidth - w_pos + "px";
                  document.getElementById("map__box04").style.height = $var.Map.mapHeight - h_pos + "px";
                  document.getElementById("map__box03").style.height = h_pos + "px";
                  // console.log($var.Map.mapHeight);
                  // console.log(h_pos);
              }
          } else {
              $('#ActionBar__Views__btn').removeClass('--active');
              $('.map__multipleViews').removeClass('--active');
          }
          // console.log($var.Map.mapWidth);
      
        }
        // Función - Activa/Desactiva el identify
        $var.Map.activateIdentify = function () {
          var status = $( '#ActionBar__identify__btn' ).hasClass('--active');
          if ( status == true) {
              $( '#ActionBar__identify__btn' ).removeClass("--active");
              $var.Map.clickableLayer = false;
              $var.Map.layers.layerDatos.forEach(function(feature){
                  $var.Map.layers.layerDatos.overrideStyle(feature, {clickable: false});
              })            
          } 
          else {
              $( '#ActionBar__identify__btn' ).addClass('--active');
              $var.Map.clickableLayer = true;
              $var.Map.layers.layerDatos.forEach(function(feature){
                $var.Map.layers.layerDatos.overrideStyle(feature, {clickable: true});
            })
          }
        }
    }
    return initMap(); 
  }

  $(document).ready(initGlobales);
