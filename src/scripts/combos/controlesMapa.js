// Importando archivos
var $jq = require("jquery");
var $var = require("./variables");
    // Acción que lanza función poner en pantalla completa el mapa (Fullscreen)
    $( '#ActionBar__FullScreen__btn' ).on( 'click', function () {
        var elementToSendFullscreen =   $var.Map.map.getDiv().firstChild;
        elementToSendFullscreen.requestFullscreen();
    });

    // Acción que lanza función centrar el mapa en la pantalla (Fullextend)
    $( '#ActionBar__FullExtend__btn' ).on( 'click', function () {
        $var.Map.Map.centrarMapa();
    });

    // Acción que lanza función que habilita la vista de Street View con base en el parámetro --active
    $( '#ActionBar__StreetView__btn' ).on( 'click', function () {
        $var.Map.streetView();
    });

    // Acción que lanza función deshabilitar la opción de arrastrar en el Mapa
    $( '#ActionBar__moveMap__btn' ).on( 'click', function () {
        $var.Map.draggable();
    });

    $( '#ActionBar__RectangleZoom__btn' ).on( 'click', function () {
        $var.Map.zoomRectangle();
    });

    $( '#ActionBar__Slide__btn' ).on( 'click', function () {
        $var.Map.slideScreen();
    });

    $( '#ActionBar__Perspective__btn' ).on( 'click', function () {
        $( '.ActionBar__list__item__btn' ).removeClass("--active");
        $( '#ActionBar__Perspective__btn' ).addClass('--active');
    });

    // Acción que lanza las multiples vistas de mapa
    $( '#ActionBar__Views__btn' ).on( 'click', function () {
        $var.Map.multipleScreen();
    });

    $( '#ActionBar__identify__btn' ).on( 'click', function () {
        $var.Map.activateIdentify();
    });

