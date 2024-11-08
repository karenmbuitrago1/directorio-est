// Importando archivos
var $jq = require("jquery");
var $var = require("./variables");
var shpwrite = require('@aleffabricio/shp-write');
var geomToGml = require('geojson-to-gml-3');
var c = console.log;
var urlGet = new URL(window.location.href);
var codigoVisor = 7;
var typeMapDivision = 0;
var serverPath = "https://geoportal.dane.gov.co/upload/"
var markersMedidas = []
var arrayMarkers = []
var arrayPuntos = []
var arrayMarkersLabel = []
var activeMedida = false
var typeMedida = 0
var isDraw = false;
var heatIntensity = 0;
var primeraCarga = false;
var wmsLayer;
var wms3DLayer;
var varTema = "";
var varSubtema = "";
var varVariable = "";
var datosGraficos;
var labelsGeografia = [];
var listaDivipolaDeptos = [];
var listaNivelesFiltro = []
var listaVariables = []
var listaFilterVariables = []
var listaTipo = []
var listaNombresVariables = []
var listaVisualizacion = []
var listaUnidades = []
var listaColores = []
var listaAdicional = []
var listaClaseTiene = []
var listaCompuestoTiene = []
var listaDescripcion = []
var listaTotal = []
var listaSexo = []
var listaAnioTiene = []
var listaDivipolaMpios = []
var arrayTotales = []
var listaCentroides = []
var listaDirectorio = 0;

var allTematicas = [];

var resultadoCortes = []
var nombresLeyenda = []
var arrayCirculos = []
var datosMapa;
var datosPoblacion;
var poligono = null
var clicPunto;
var active3D = false;
var active3DLeft = false;
var filtroArea = 0;
var metodo = 0;
var heatmap = null;
var typeMap = 1;
var typeDivision = 0;
var numberClass = 5;
var colorClass = "";
var percentageMapOpacity = 1;
var getZoomMap = d3.scale.linear().range([18, 0]).domain([0, $(".ActionBar__list__item__scrollBar").height()]);

var counties = d3.map();
var max_population = 0;
var min_population = 0;
var mouse = new THREE.Vector2();
var MAX_EXTRUSION = 5;
var RO_CENTER = [4.609278084409835, -72.5];
var extr = [];
var arrayMax = [];
var idAnimation;
var renderer, scene, camera, raycaster, cube, meshes = [];

var circulo = []


$(".searchBox__input").on("keyup", function (event) {
    var value = $(this).val().toLowerCase();
    $(".functionFilter__container__selectListbox__selectList__item").filter(function () {
        // console.log($(this).text().toLowerCase())
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });

});

function loadDivipola() {
    urlDivipola = 'https://geoportal.dane.gov.co/laboratorio/serviciosjson/cnpv/divipola.php';
    $.ajax({
        url: urlDivipola,
        type: "GET",
        success: function (data) {
            if (data.resultado.length > 0) {
                $("#FiltroGeograficoLvl1").html("");
                $('<option value="-1">Todos los departamentos</option>').appendTo($("#FiltroGeograficoLvl1"));
                $("#place__department").text("Todos los departamentos")
                $("#results__panel__title__site").text("Todos los departamentos")
                for (var i = 0; i < data.resultado.length; i++) {
                    $('<option value="' + data.resultado[i]["U_DPTO"] + '">' + data.resultado[i]["U_DPTO"] + ' - ' + data.resultado[i]["NOM_DPTO"].toUpperCase() + '</option>').appendTo($("#FiltroGeograficoLvl1"));
                    listaDivipolaDeptos.push([data.resultado[i]["U_DPTO"], data.resultado[i]["NOM_DPTO"].toUpperCase()])
                }
                // loadAnios();
                // loadTematicas();
                loadDataDirectorio();
            }
        }
    });
}
// */

//* Carga "Filtros temáticos" en el menu de Interacción.
//* Carga "Filtros temáticos" en el menu de Interacción.
function loadTematicas(){
    var servicioTemas = $var.Map.urlTemas + '?codigo=' + $var.Map.codigoVisor;
    $.ajax({
        url: servicioTemas,
        type: "GET",
        success: function (data) {
            // c('data0001',data)
            let cod_grupo = groupByFunct(data, "COD_GRUPO")
            // c('cod_grupo',cod_grupo)
            var servicioSubTemas = $var.Map.urlTemas + '?codigo=' + $var.Map.codigoVisor + '&sub_temas=' + 'yes';
            $.ajax({
                url: servicioSubTemas,
                type: "GET",
                success: function (dataDos) {
                    // c('data0002',dataDos)
                    let cod_subGrupo = groupByFunct(dataDos, "COD_SUBGRUPO")
                    var urlVariable = $var.Map.urlTemas + '?codigo=' + $var.Map.codigoVisor + '&variables=' + 'yes';
                    $.ajax({
                        url: urlVariable,
                        type: "GET",
                        success: function (dataTres) {
                            // c('data0003',dataTres)
                            listaTematica(cod_grupo, cod_subGrupo, dataTres);   
                            var firstTematica = false
                            if (dataTres.length > 0) {
                                $("#variable3D").html("");
                                for (var i = 0; i < dataTres.length; i++) {
                                    if (dataTres[i]["NIVELES_FILTRO"] == "0") {
                                        listaFilterVariables.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["CAMPO_TABLA"]]);
                                        listaVariables.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["CAMPO_TABLA"]]);
                                    }
                                    else if (dataTres[i]["NIVELES_FILTRO"] == "1") {
                                        listaFilterVariables.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["CAMPO_DOMINIO"]]);
                                        listaVariables.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["VALOR_DOMINIO"]]);
                                    }
                                    else if (dataTres[i]["NIVELES_FILTRO"] == "2") {
                                        listaFilterVariables.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["CAMPO_DOMINIO2"]]);
                                        listaVariables.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["VALOR_DOMINIO2"]]);
                                    }
                                    else if (dataTres[i]["NIVELES_FILTRO"] == "3") {
                                        listaFilterVariables.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["CAMPO_DOMINIO3"]]);
                                        listaVariables.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["VALOR_DOMINIO3"]]);
                                    }
                                    listaNivelesFiltro.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["NIVELES_FILTRO"]]);
                                    listaNombresVariables.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["CATEGORIA"]]);
                                    listaVisualizacion.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["GRAFICO_ESTADISTICO"]]);
                                    listaColores.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["COLOR"].replace("(", "").replace(")", "")]);
                                    listaUnidades.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["UNIDAD"]]);
                                    listaAdicional.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["CATEGORIA"]]);
                                    listaDescripcion.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["CATEGORIA"]]);
                                    listaTotal.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["TOTAL"]]);
                
                                    listaClaseTiene.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["FILTRO_CLASE"]]);
                                    listaSexo.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["FILTRO_SEXO"]]);
                                    listaAnioTiene.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["FILTRO_TIEMPO"]]);
                
                                    listaCompuestoTiene.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["VISUAL_AGRUPADO"]]);
                                    listaTipo.push([dataTres[i]["COD_CATEGORIA"], dataTres[i]["TIPO_VARIABLE"]]);                
   
                                }
                            }
                            $(".results").removeClass("--collapse")
                            $(".ActionBar").removeClass("--collapseRight")
                            $(".map").removeClass("--collapseRight")

                            var texto = $(".--variables-tematicas").find(".--active").text()
                            // var variable = $(".--variables-tematicas").find(".--active").attr("id").split("__")[1];
                            // c('listaVariables',listaVariables)
                            // c($var.Map.varVariable,'$var.Map.varVariable')
                            varTema = $var.Map.varVariable.substring(0, 3);
                            varSubtema = $var.Map.varVariable.substring(0, 5);
                            // $var.Map.varVariable = $var.Map.variable;

                            setTimeout(function () {
                                if (urlGet.search != "" && urlGet.searchParams.get("t") != null && urlGet.searchParams.get("s") != null && urlGet.searchParams.get("v") != null) {
                                    varTema = urlGet.searchParams.get("t");
                                    varSubtema = urlGet.searchParams.get("s");
                                    $var.Map.varVariable = urlGet.searchParams.get("v");
                                }
                                loadEstadisticas(varTema, varSubtema,  $var.Map.varVariable);
                                var title = $(".functionFilter__thematic__item."+$var.Map.varVariable.substring(0,5)+" .functionFilter__thematic__nameGroup").text()
                                var subtitle = $(".functionFilter__thematic__item."+$var.Map.varVariable.substring(0,5)+" .functionFilter__thematic__name").text()
                                var nameVar = $(".functionFilter__thematicVariable__item.--active").text()

                                $(".map__name__subtitle").text(title+" - "+subtitle+" - "+nameVar);
                                $(".functionFilter__description__title").text(title+" - "+subtitle+" - "+nameVar);
                                $(".results__panel__title__themeName").text(title+" - "+subtitle+" - "+nameVar);
                                $(".Geovisor__tableBox__top__tableName").text("Tabla de datos" + " - " + $(".results__panel__title__themeName").text());
                            }, 1000);
                        }
                    });
                }
            });
        }
    });

    //search buscador por variables
    $(".searchBox__input").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $(".functionFilter__thematicVariable__item").filter(function () {
            // console.log($(this).text().toLowerCase())
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            $('.functionFilter__thematic__item').addClass('--search')
        });    
        // c($(".searchBox__input").val())
        if($(".searchBox__input").val() == ""){
            $('.functionFilter__thematic__item').removeClass('--search')
        }    
    });  
}

function groupByFunct(array, key) {
    const groupBy = array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {});
    return groupBy
}

function listaTematica(cod_grupo, cod_subGrupo, dataTres){
    // c('listaTematica',cod_grupo, cod_subGrupo, dataTres)
     //pintar los botones de los grupos globales
     var count = 0
     $.each(cod_grupo, function (key, value) {
        //para la herramienta de filtros en el panel Toolbar
        count ++
        var listaGrupo = $('<li/>', { id: value[0]["COD_GRUPO"], class: 'functionFilter__thematicGroup__item ' + value[0]["COD_GRUPO"] });
        let cajaGrupo = $('<div/>', { class: 'functionFilter__thematicGroup__icon ' + value[0]['CLASE_COLOR'] });
        $('<span/>', { class: value[0]['CLASE_ICONO'] }).appendTo(cajaGrupo);
        cajaGrupo.appendTo(listaGrupo);
        $('<p/>', { class: 'functionFilter__thematicGroup__name', text: " " + value[0]["GRUPO"] }).appendTo(listaGrupo);    
        listaGrupo.appendTo($(".functionFilter__thematicGroup__list"));
        
    });
    
    //para pintar las variables de los grupos tematicos
    // c('cod_subGrupo',cod_subGrupo)    
    
    $.each(cod_subGrupo, function (key, value) {        
        
        //para la herramienta de filtros en el panel Toolbar
        var listaGrupo = $('<li/>', { id: value[0]["COD_SUBGRUPO"], class: 'functionFilter__thematic__item ' + value[0]["COD_SUBGRUPO"] });
        var listaVariable = $('<ul/>', { id: value[0]["COD_SUBGRUPO"], class: 'functionFilter__thematicVariable__list ' + value[0]["COD_SUBGRUPO"] });
        $('<h3/>', { class: 'functionFilter__thematic__name', text: " " + value[0]["SUBGRUPO"] }).appendTo(listaGrupo);    
        listaVariable.appendTo(listaGrupo);
        listaGrupo.appendTo($(".functionFilter__thematic__list"));
        var thecode = value[0]["COD_SUBGRUPO"].substring(3,0)
        var grupoLista = $(".functionFilter__thematicGroup__item."+thecode+" ").text()
        var newP = $('<p/>', { class: 'functionFilter__thematic__nameGroup', text: " " + grupoLista });  
        newP.insertBefore($('.functionFilter__thematic__item#'+value[0]["COD_SUBGRUPO"]+' .functionFilter__thematic__name'));
    });
    //CUando hay mas de 3 temas mostrar el botón de más temas
    // c("count",count)
    if(count<=2){
        $('.functionFilter__thematicGroup__more').addClass('--invisible');
        $('.functionFilter__thematicGroup').addClass('--full');
    }else if(count>3){
        $('.functionFilter__thematicGroup__more').removeClass('--invisible');
    }
    var myData = dataTres
    // c('mydata',myData)
    myData.map(function (obj, j, k) {    
         
        let subGrupo = obj['COD_SUBGRUPO'];
        obj["grupo"] = cod_grupo[subGrupo.substring(0, 3)]
        obj["subGrupo"] = cod_subGrupo[subGrupo]

        //para la herramienta de filtros en el panel Toolbar
        var listaTemp = $('<li/>', { id: obj['COD_CATEGORIA'], class: 'functionFilter__thematicVariable__item ' + obj['COD_CATEGORIA'], title: obj['grupo'][0]['GRUPO'] +" - "+  obj['SUBGRUPO'] });        
        let cajaUno = $('<div/>', { class: 'functionFilter__thematicVariable__radio' });
        $('<span/>', { class: 'DANE__Geovisor__icon__radioButton' }).appendTo(cajaUno);   
        let cajaDos = $('<p/>', { class: 'functionFilter__thematicVariable__value', text:" " + obj['CATEGORIA'] })
        let cajaTres = $('<div/>', { class: 'functionFilter__thematicVariable__icon ',style:'background:rgba' + obj['COLOR'] });                 
        $('<span/>', { class: obj["grupo"][0]['CLASE_ICONO'] }).appendTo(cajaTres);
        cajaUno.appendTo(listaTemp);
        cajaDos.appendTo(listaTemp);
        cajaTres.appendTo(listaTemp);
        listaTemp.appendTo($(".functionFilter__thematicVariable__list."+subGrupo));

    }, []);
    $var.Map.listaVariables = groupByFunct(dataTres, "COD_CATEGORIA");
    // c($var.Map.listaVariables)


    $('.functionFilter__thematic__item').click(function (e) {
        e.stopPropagation();
        $(this).toggleClass('--collapse');
    });
    
    
    // // console.log(dataTres)
    $('.functionFilter__thematicVariable__item').click(function (e) {
        e.stopPropagation();
        $('.functionFilter__thematicVariable__item').removeClass('--active');
        $(this).addClass('--active');
        $var.Map.varVariable = $(this).attr("id");
        // c( $var.Map.varVariable.substring(0, 3), $var.Map.varVariable.substring(0, 5), $var.Map.varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())

        varTema = $var.Map.varVariable.substring(0, 3);
        varSubtema = $var.Map.varVariable.substring(0, 5);
        varVariable = $var.Map.varVariable;
        var title = $(".functionFilter__thematic__item."+$var.Map.varVariable.substring(0,5)+" .functionFilter__thematic__nameGroup").text()
        var subtitle = $(".functionFilter__thematic__item."+$var.Map.varVariable.substring(0,5)+" .functionFilter__thematic__name").text()
        var nameVar = $(".functionFilter__thematicVariable__item.--active").text()
        $(".map__name__subtitle").text(title+" - "+subtitle+" - "+nameVar);
        $(".functionFilter__description__title").text(title+" - "+subtitle+" - "+nameVar);
        $(".results__panel__title__themeName").text(title+" - "+subtitle+" - "+nameVar);
        $(".results__panel__title__theme").text(title);
        $(".results__panel__title__subtheme").text(subtitle);
        $(".results__panel__title__variable").text(nameVar);
        $(".Geovisor__tableBox__top__tableName").text("Tabla de datos" + " - " + $(".results__panel__title__themeName").text());
        $(".loader").addClass('--active');
        if ($("#FiltroGeograficoLvl1").val() == "-1") {
            loadEstadisticas(varTema, varSubtema, varVariable)
        }
        else {
            if ($("#FiltroGeograficoLvl2").val() == "-1") {
                loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val())
            }
            else {
                loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
            }
        }
        if ($(window).width() < 769) {
            $('.toolBar').toggleClass("--visible").removeClass("--collapse");
            $('.toolBar__menu').toggleClass("--active");
        }
    });


    $('.functionFilter__thematicGroup__item').click(function (e) {
        e.stopPropagation();
        $('.--filtros').removeClass('--visibleGroupPrincipal');
        $('.functionFilter__thematicGroup__item').removeClass('--active');
        if($(this).hasClass('--active')){
            $(this).removeClass('--active');
            $('.functionFilter__thematicGroup__item').removeClass('--active');
            $(".functionFilter__thematic__item").filter(function () {
                $(this).toggle($(this).attr("id").indexOf('') > -1);
            });
        }else{            
            $(this).addClass('--active');
            var groupID = $(this).attr("id");
            $(".functionFilter__thematic__item").filter(function () {
                $(this).toggle($(this).attr("id").indexOf(groupID) > -1)
            });
        }
    });

    // //asignar clase active por defecto a variable seleccionada
    $('.'+$var.Map.varTema.substring(0, 3)).addClass('--active').trigger('click')
    // c('0$var.Map.varVariable',$var.Map.varVariable)
    $('.'+$var.Map.varVariable).addClass('--active');
    // $('.'+$var.Map.varVariable.substring(0, 3)).addClass('--active').trigger('click')

    var title = $(".functionFilter__thematic__item."+$var.Map.varVariable.substring(0,5)+" .functionFilter__thematic__nameGroup").text()
    var subtitle = $(".functionFilter__thematic__item."+$var.Map.varVariable.substring(0,5)+" .functionFilter__thematic__name").text()
    var nameVar = $(".functionFilter__thematicVariable__item.--active").text()

    $(".map__name__subtitle").text(title+" - "+subtitle+" - "+nameVar);
    $(".functionFilter__description__title").text(title+" - "+subtitle+" - "+nameVar);
    $(".results__panel__title__themeName").text(title+" - "+subtitle+" - "+nameVar);
    $(".results__panel__title__theme").text(title);
    $(".results__panel__title__subtheme").text(subtitle);
    $(".results__panel__title__variable").text(nameVar);
    $(".Geovisor__tableBox__top__tableName").text("Tabla de datos" + " - " + $(".results__panel__title__themeName").text()); // 
  
}

$var.Map.loadTemas = function () {
    urlTemas = 'https://geoportal.dane.gov.co/laboratorio/serviciosjson/visores/temas.php' + '?codigo=' + $var.Map.codigoVisor + '&sub_temas=' + 'yes';
    $.ajax({
        url: urlTemas,
        type: "GET",
        success: function (data) {
            if (data.length > 0) {
                totalTemas = data;
                var firstTematica = false
                for (var i = 0; i < data.length; i++) {
                    if (data[i]["COD_GRUPO"] == $(".functionFilter__container__selectListbox__selectList__item.--active").attr("id")) {
                        if (!firstTematica) {
                            $('<li class="functionFilter__container__selectListbox__selectList__item level__2 --active " id="' + data[i]["COD_SUBGRUPO"] + '"><div class="functionFilter__accordion__panel__theme__btn --nameSubtema"><div class="functionFilter__accordion__panel__theme__btn__radio"><span class="DANE__Geovisor__icon__radioButton"></span></div><p class="functionFilter__accordion__panel__theme__btn__name">' + data[i]["SUBGRUPO"] + '</p></div><div class="functionFilter__container__selectListbox --tab02"><ul class="functionFilter__container__selectListbox__selectList --variables-tematicas ' + data[i]["COD_SUBGRUPO"] + '"></ul></div></li>').appendTo($(".--subtemas-tematicas." + data[i]["COD_GRUPO"]));
                            firstTematica = true;
                            $(".functionFilter__description__text").text(data[i]["DESCRIPCION_SUBGRUPO"]);
                        }
                        else {
                            $('<li class="functionFilter__container__selectListbox__selectList__item level__2" id="' + data[i]["COD_SUBGRUPO"] + '"><div class="functionFilter__accordion__panel__theme__btn --nameSubtema"><div class="functionFilter__accordion__panel__theme__btn__radio"><span class="DANE__Geovisor__icon__radioButton"></span></div><p class="functionFilter__accordion__panel__theme__btn__name">' + data[i]["SUBGRUPO"] + '</p></div><div class="functionFilter__container__selectListbox --tab02"><ul class="functionFilter__container__selectListbox__selectList --variables-tematicas ' + data[i]["COD_SUBGRUPO"] + '"></ul></div></li>').appendTo($(".--subtemas-tematicas." + data[i]["COD_GRUPO"]));
                        }
                    }
                    else {
                        $('<li class="functionFilter__container__selectListbox__selectList__item level__2" id="' + data[i]["COD_SUBGRUPO"] + '"><div class="functionFilter__accordion__panel__theme__btn --nameSubtema"><div class="functionFilter__accordion__panel__theme__btn__radio"><span class="DANE__Geovisor__icon__radioButton"></span></div><p class="functionFilter__accordion__panel__theme__btn__name">' + data[i]["SUBGRUPO"] + '</p></div><div class="functionFilter__container__selectListbox --tab02"><ul class="functionFilter__container__selectListbox__selectList --variables-tematicas ' + data[i]["COD_SUBGRUPO"] + '"></ul></div></li>').appendTo($(".--subtemas-tematicas." + data[i]["COD_GRUPO"]));
                    }
                }
                $(".map__name__subtitle").text($(".--subtemas-tematicas > .--active .--nameSubtema").text());
                $(".results__panel__title__themeName").text($(".--subtemas-tematicas > .--active.level__2 .--nameSubtema").text());
                $(".functionFilter__description__title").text($(".--subtemas-tematicas > .--active.level__2 .--nameSubtema").text());
                $(".Geovisor__tableBox__top__tableName").text("Tabla de datos" + " - " + $(".results__panel__title__themeName").text()); //              
                
            }
        }
    });
}
//* Genera los datos a partir del servicio y carga espacialmente las estadísticas sobre el mapa (layer e infoLayer)
function loadEstadisticas(tema, subtema, variable, FiltroGeograficoLvl1, FiltroGeograficoLvl2) {
    d3.select(".tooltip").remove();
    active3DLeft = false;

    if (!primeraCarga) {
        $("#totalresults").removeClass("--invisible")
        $("#totalresults").addClass("--active")
        $("#totalresults").next().addClass("--open")
    }
    else {
        $("#totalresults").removeClass("--active").addClass("--invisible")
        $("#totalresults").next().removeClass("--open")
    }

    if (getTieneClase() == "S") {
        $(".--cabecera").removeClass("--disabled")
        $(".--centroPoblado").removeClass("--disabled")
        $(".--ruralDisperso").removeClass("--disabled")
        $("#results_clase").removeClass("--invisible")
    } else {
        $(".--areaTotal").addClass("--active")
        $(".--cabecera").removeClass("--active").addClass("--disabled")
        $(".--centroPoblado").removeClass("--active").addClass("--disabled")
        $(".--ruralDisperso").removeClass("--active").addClass("--disabled")
        $("#results_clase").addClass("--invisible")
        filtroArea = 0;
    }

    // Servicio de estadísticas para directorio de empresas
    var url = "https://geoportal.dane.gov.co/laboratorio/serviciosjson/visores/variables.php" + "?codigo_subgrupo=" + subtema;

    // c(url);

    // if(getTieneAnio() == "S"){
    //     url += "&anio=" + $("#tiempoAnual").val();
    // }

    if (FiltroGeograficoLvl1 != null) {
        url += "&filtro_geografico=" + FiltroGeograficoLvl1;
    } else if (typeMapDivision == "1") {
        url += "&filtro_geografico=" + "all";
    }

    $.ajax({
        url: url,
        dataType: "JSON",
        type: "GET",
        success: function (data) {
            // c(data);
            if (data.estado) {
                // c(data);
                datosGraficos = data.resultado;
                reloadEstadisticas(tema, subtema, variable, FiltroGeograficoLvl1, FiltroGeograficoLvl2);
            }
        }
    });

}
// */

//* Carga espacialmente las estadísticas sobre el mapa (layer e infoLayer)
function reloadEstadisticas(varTema, varSubtema, varVariable, FiltroGeograficoLvl1, FiltroGeograficoLvl2) {
    datosPoblacion = datosGraficos;
    // c(varTema, varSubtema, varVariable, FiltroGeograficoLvl1, FiltroGeograficoLvl2);

    // Servicio que muestra los puntos sobre el Mapa.
    var urlEmpresas = "https://geoportal.dane.gov.co/laboratorio/serviciosjson/directoriodeempresas/coordenadas1.php";

    if (FiltroGeograficoLvl2 && FiltroGeograficoLvl2 != -1) {
        urlEmpresas += "?cod_dpto=" + FiltroGeograficoLvl1 + "&cod_mpio=" + FiltroGeograficoLvl2;
    }

    if ($var.Map.varVariable == null) {
        urlEmpresas += "&grupo=" + varTema;
    } else {
        listaVariables.forEach(function name(varList) {
            // Excepción - Activa o no filtro temático
            if (varList[0] == $var.Map.varVariable) {
                urlEmpresas += "&ciiu=" + varList[1];
            }
        });
    }

    if ($var.Map.visualMarkers.length > 0) {
        $var.Map.delVisualMarkers($var.Map.visualMarkers);
        $var.Map.visualMarkers = [];
        if ($var.Map.circuloAnalisis) {
            $var.Map.circuloAnalisis.setMap(null);
        }
    }

    // c(urlEmpresas);

    if ($("#FiltroGeograficoLvl1").val() != "-1" && $("#FiltroGeograficoLvl2").val() != "-1") {
        // Oculta botón descarga Esri Shapefile
        // $("#DownloadExt__shp").css("display", "none");
        // loadMapa(datosGraficos);
        $.ajax({
            url: urlEmpresas,
            dataType: "JSON",
            type: "GET",
            success: function (data) {
                // console.log(data);
                if (data.estado) {
                    // c(data);
                    datosEspaciales = data.resultado;
                    // $var.Map.loadTabla(datosEspaciales);
                    $var.Map.loadMarkers(datosEspaciales);
                    // c(datosEspaciales);
                }
            }
        });
    }

    if ($var.Map.activadoPoly) {
        borrarPoly();
    }
    $var.Map.activadoPoly = false;
    for (var i = 0; i < arrayPuntos.length; i++) {
        arrayPuntos[i].setMap(null);
    }
    arrayPuntos = [];

    for (var i = 0; i < arrayCirculos.length; i++) {
        arrayCirculos[i].setMap(null);
    }
    arrayCirculos = [];
    if (heatmap != null) {
        heatmap.setMap(null)
    }

    if (!primeraCarga){
        // $(".results").addClass("--collapse")
        $(".ActionBar__list").addClass("--invisible")
        // $(".map").addClass("--collapseRight")
        $('.map__tinyMap').addClass('--hidden')
        
    }else{
        // $(".results").removeClass("--collapse")
        // $(".ActionBar").removeClass("--collapseRight")
        // $(".map").removeClass("--collapseRight")
        
    }

    $(".results").removeClass("--collapse")
    $(".ActionBar").removeClass("--collapseRight")
    $(".map").removeClass("--collapseRight")

    d3.select("#donaGraph").remove();
    d3.select(".map__legend__symbol svg").remove();
    $(".results__panel__title").show();
    $(".results__panel__selectGraph").show();
    $(".loadOne").remove();
    $(".loadTwo").remove();
    $(".loadThree").remove();

    var variableVisualizacion = "";
    for (var i = 0; i < listaVisualizacion.length; i++) {
        if (listaVisualizacion[i][0] == $var.Map.varVariable) {
            variableVisualizacion = listaVisualizacion[i][1];
        }
    }
    var totalVariables = [];
    for (var a = 0; a < listaVariables.length; a++) {
        if (varSubtema == listaVariables[a][0].substring(0, 5)) {
            totalVariables.push(listaVariables[a][1]);
        }
    }
    if (getTipoDiv() == "VC" || getTipoDiv() == "C") {

        $("#results_tematico").removeClass("--invisible")
        $("#results_tematico").addClass("--active")
        $("#results_tematico").next().addClass("--open")


        $("#results_entidad").removeClass("--active")
        $("#results_entidad").removeClass("--open")
        // $("#results_entidad").next().addClass("--open")
        $("#results_entidad .functionFilter__accordion__btn__name").text("Distribución de las Empresas") //Participación ente territorial

        $(".results__panel__selectGraph__principalList li").removeClass("--active");
        $("#selectGraphs__value").addClass("--invisible");
        $("#selectGraphs__piramide").addClass("--invisible");

        if (variableVisualizacion == "P") {
            $("#selectGraphs__piramide").removeClass("--invisible");
            $("#selectGraphs__piramide").addClass("--active")
            loadPiramide(datosGraficos)
        }
        else if (totalVariables.length > 5) {
            $("#selectGraphs__bars_v").addClass("--active")
            loadBarsV(datosGraficos)
        }
        else {
            if (variableVisualizacion == "HH") {
                $("#selectGraphs__bars_v").addClass("--active")
                loadBarsV(datosGraficos)
            }
            else if (variableVisualizacion == "T") {
                $("#selectGraphs__cake").addClass("--active")
                loadPie(datosGraficos)
            }
            else if (variableVisualizacion == "V") {
                $("#selectGraphs__value").removeClass("--invisible");
                $("#selectGraphs__value").addClass("--active")
                loadValor(valores, baseBusqueda)
            }
            else {
                $("#selectGraphs__cake").addClass("--active")
                loadPie(datosGraficos)
                $(".loader").removeClass('--active');
            }
        }
    }
    else if (getTipoDiv() == "VAC") {
        $("#results_tematico").removeClass("--invisible")
        $("#results_tematico").addClass("--active")
        $("#results_tematico").next().addClass("--open")

        $("#results_entidad").removeClass("--active")
        $("#results_entidad").next().removeClass("--open")
        $("#results_entidad .functionFilter__accordion__btn__name").text("Participación de la entidad territorial")

        $(".results__panel__selectGraph__principalList li").removeClass("--active");

        $("#selectGraphs__bars_v").addClass("--active")
        loadBarsV(datosGraficos)
    } else {
        $("#results_tematico").addClass("--invisible")
        $("#results_tematico").next().removeClass("--open")
        $("#results_tematico").removeClass("--active")

        $("#results_entidad").addClass("--active")
        $("#results_entidad").next().addClass("--open")
        $("#results_entidad .functionFilter__accordion__btn__name").text("Índices por entidad territorial")
    }

    loadMapa(datosGraficos)
    loadBarsV(datosGraficos)
    loadHistorico(datosGraficos)
    loadTabla(datosGraficos)
}
// */

//* Load Directorio 
function loadDataDirectorio() {

    var urltotal = "https://geoportal.dane.gov.co/laboratorio/serviciosjson/directoriodeempresas/conteociiu.php";

    if ($("#FiltroGeograficoLvl1").val() == "-1") {
        urltotal += "?tipociiu=ciiu4"
    }
    if ($("#FiltroTotalLvl1").val() == "05801002") {
        urltotal += "?tipociiu=ciiu4"
    }
    if ($("#FiltroTotalLvl1").val() == "05801003") {
        urltotal += "?tipociiu=todos"
    }

    // c(urltotal);

    $.ajax({
        url: urltotal,
        type: "GET", success: function (data__total) {
            $(".results__panel__total__data__actividades").empty();
            //console.log(data__total)
            for (var i = 0; i < data__total.length; i++) {
                if (data__total[i]["TOTAL"]) {
                    // console.log(data__total[i]["TOTAL"]);
                    $('<li class="results__panel__total__data__actividades">' + parseFloat(data__total[i]["TOTAL"]).toLocaleString("de-De") + '</div>').appendTo('.results__panel__total__data__actividades');
                }
            }

            $(".results__panel__total__data__empresas").empty();
            //console.log(data__total)
            for (var i = 0; i < data__total.length; i++) {
                if (data__total[i]["TOTAL_EMPRESAS"]) {
                    // console.log(data__total[i]["TOTAL_EMPRESAS"]);
                    $('<div class="results__panel__total__data__empresas">' + parseFloat(data__total[i]["TOTAL_EMPRESAS"]).toLocaleString("de-De") + '</div>').appendTo('.results__panel__total__data__empresas');
                }
            }
        }
    });
}
// */

//* Visualización de Pie 
function loadPie(data) {
    var dataPie = [];
    var dataPiePorcentajes = [];
    var totalPie = 0;
    var variablesArreglo = [];
    var variablesFiltroArreglo = [];
    var variablesNombreArreglo = [];

    for (var a = 0; a < listaVariables.length; a++) {
        if (varSubtema == listaVariables[a][0].substring(0, 5)) {
            variablesArreglo.push(listaVariables[a][1]);
            variablesFiltroArreglo.push(listaFilterVariables[a][1]);
            variablesNombreArreglo.push(listaNombresVariables[a][1]);
        }
    }
    // c("variablesArreglo del Pie", variablesArreglo)
    // c("variablesFiltroArreglo del Pie", variablesFiltroArreglo)
    // c("variablesNombreArreglo del Pie", variablesNombreArreglo)

    for (var j = 0; j < variablesArreglo.length; j++) {
        dataPie.push(0);
        dataPiePorcentajes.push(0);
    }
    var colores = []
    for (var a = 0; a < listaColores.length; a++) {
        var auxSubtema = listaColores[a][0].substring(0, 5)
        if (varSubtema == auxSubtema) {
            colores.push(chroma(listaColores[a][1].split(",")));
        }
    }

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < variablesArreglo.length; j++) {
            //if (data[i]["ANIO"] == $("#tiempoAnual").val()) {
            if (getNivelesFiltro() == "0") {
                if ($("#FiltroGeograficoLvl2").val() == "-1" || $("#FiltroGeograficoLvl1").val() == "-1") {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            }
                        }
                    }
                    else {
                        dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                        dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                        totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                    }
                }
                else {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (data[i]["CODIGO_F2"].length == 3) {
                                if ((data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                    dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                }
                            }
                            else {
                                if (data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                    dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                }
                            }
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                if (data[i]["CODIGO_F2"].length == 3) {
                                    if ((data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                        dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                        dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                        totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    }
                                }
                                else {
                                    if (data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                        dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                        dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                        totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (data[i]["CODIGO_F2"].length == 3) {
                            if ((data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            }
                        }
                        else {
                            if (data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            }
                        }
                    }
                }

            } else {
                if ($("#FiltroGeograficoLvl2").val() == "-1" || $("#FiltroGeograficoLvl1").val() == "-1") {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j]) {
                                dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j]) {
                                    dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                                }
                            }
                        }
                    }
                    else {
                        if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j]) {
                            dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                            dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                            totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                        }
                    }
                }
                else {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (data[i]["CODIGO_F2"].length == 3) {
                                if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                    dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                                }
                            }
                            else {
                                if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                    dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                                }
                            }
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                if (data[i]["CODIGO_F2"].length == 3) {
                                    if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                        dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                        dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                        totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                                    }
                                }
                                else {
                                    if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                        dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                        dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                        totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (data[i]["CODIGO_F2"].length == 3) {
                            if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                        else {
                            if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                    }
                }
            }
            // }
        }
    }

    // c("array del Pie", dataPie)

    for (var j = 0; j < dataPiePorcentajes.length; j++) {
        dataPiePorcentajes[j] = (dataPiePorcentajes[j] * 100) / totalPie;
    }

    if ($(".results__panel__graphs").width() == 0) {
        var width = $(".Geovisor__content").width() * 0.2 - 20;
    } else {
        var width = $(".results__panel__graphs").width();
    }
    var radius = (width * 0.6) / 2;
    var height = dataPie.length * 25 + (radius * 2.4) + 20;

    var arc = d3.svg.arc()
        .outerRadius(radius * 0.7)
        .innerRadius(0);

    var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 1.2);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d;
        });

    d3.select("#resultGraph").remove();
    var svg = d3.select(".results__panel__graphs")
        .append("svg")
        .attr("id", "resultGraph")
        .attr("class", "results__panel__graphs__pieGraph")
        .attr("width", width)
        .attr("height", height);

    var grapho = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + (radius + 30) + ")");

    var g = grapho
        .selectAll(".arc")
        .data(pie(dataPie))
        .enter()
        .append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function (d, i) {
            return colores[i];
        })
        .style("cursor", "pointer")
        .on("mouseover", function (d, i) {
            d3.select(".tooltip").remove();
            div = d3.select("body")
                .append("div")
                .attr("class", "tooltip");
        })
        .on("mousemove", function (d, i) {
            div.selectAll("text").remove();
            div.append("text")
                .html(variablesNombreArreglo[i] + ": " + d.data.toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + " (" + parseFloat(dataPiePorcentajes[i].toFixed(1)).toLocaleString("de-De") + "%)");
            div.style("left", (d3.event.pageX - 100) + "px")
                .style("top", (d3.event.pageY + 40) + "px");
        })
        .on("mouseout", function (d, i) {
            div.remove();
        });
    var u = svg.selectAll("path")
        .data(pie(dataPie))
        .transition()
        .ease("bounce")
        .duration(2000)
        .attrTween("d", tweenPie)
        .transition()
        .ease("elastic")
        .delay(function (d, i) { return 2000 + i * 50; })
        .duration(750)
        .attrTween("d", tweenDonut);

    function tweenPie(b) {
        b.innerRadius = 0;
        var i = d3.interpolate({ startAngle: 0, endAngle: 0 }, b);
        return function (t) { return arc(i(t)); };
    }

    function tweenDonut(b) {
        b.innerRadius = radius * .6;
        var i = d3.interpolate({ innerRadius: 0 }, b);
        return function (t) { return arc(i(t)); };
    }

    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    var g = grapho
        .selectAll(".arctext")
        .data(pie(dataPie))
        .enter()
        .append("g")
        .attr("class", "arctext");

    g.append("text")
        .attr("dy", ".35em")
        .attr("transform", function (d) {
            var pos = outerArc.centroid(d);
            pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
            return "translate(" + pos + ")";
        })
        .attr("text-anchor", function (d) {
            return midAngle(d) < Math.PI ? "start" : "end";
        })
        .text(function (d, i) {
            if (dataPiePorcentajes[i] > 5) {
                return parseFloat(dataPiePorcentajes[i].toFixed(1)).toLocaleString("de-De") + "%";
            }
        });

    var g = grapho
        .selectAll(".polytext")
        .data(pie(dataPie))
        .enter()
        .append("g")
        .attr("class", "polytext");

    g.append("polyline")
        .attr("points", function (d, i) {
            if (dataPiePorcentajes[i] > 5) {
                var pos = outerArc.centroid(d);
                pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                return [arc.centroid(d), outerArc.centroid(d), pos];
            }
        });

    svg.append("g")
        .attr("transform", "translate(" + 0 + "," + ((radius * 2) + 40) + ")")
        .append("text")
        .attr("class", "legend__name")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr('font-size', '0.8em')
        .attr('font-weight', '500')
        .text("Total: " + totalPie.toLocaleString("de-DE") + " " + getUnidades(varVariable));

    var legend = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + ((radius * 2) + 60) + ")")
        .attr("class", "legend");

    legend.selectAll('g')
        .data(dataPie)
        .enter()
        .append('g')
        .each(function (d, i) {
            var g = d3.select(this);
            g.append("rect")
                .attr("x", function () {
                    return -width / 2;
                })
                .attr("y", function () {
                    return (i * 20);
                })
                .attr("width", 10)
                .attr("height", 10)
                .attr("class", "legend__square")
                .style("fill", colores[i]);

            g.append("text")
                .attr("x", function () {
                    return -width / 2 + 20;
                })
                .attr("y", function () {
                    return 10 + (i * 20);
                })
                .attr("height", 30)
                .attr("width", 100)
                .attr("class", "legend__name")
                .text(function (d) {
                    return variablesNombreArreglo[i];
                });
        });

    //TO PRINT
    if ($(".Modal__panel__graphs").width() == 0) {
        var widthPrint = $(".Geovisor__content").width() * 0.58;
    } else {
        var widthPrint = $(".Modal__panel__graphs").width();
    }
    var radiusPrint = (widthPrint * 0.6) / 2;
    var heightPrint = dataPie.length * 25 + (radiusPrint * 2.4) + 20;

    var arcPrint = d3.svg.arc()
        .outerRadius(radiusPrint * 0.7)
        .innerRadius(0);

    var outerArcPrint = d3.svg.arc()
        .innerRadius(radiusPrint * 0.9)
        .outerRadius(radiusPrint * 1.2);

    var piePrint = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d;
        });

    d3.select("#resultGraphPrint").remove();
    var svgPrint = d3.select(".Modal__panel__graphs")
        .append("svg")
        .attr("id", "resultGraphPrint")
        .attr("class", "Modal__panel__graphs__pieGraph")
        .attr("width", widthPrint)
        .attr("height", heightPrint);

    var grapho = svgPrint.append("g")
        .attr("transform", "translate(" + widthPrint / 2 + "," + (radiusPrint + 30) + ")");

    var g = grapho
        .selectAll(".arc")
        .data(piePrint(dataPie))
        .enter()
        .append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arcPrint)
        .style("fill", function (d, i) {
            return colores[i];
        })

    var u = svgPrint.selectAll("path")
        .data(piePrint(dataPie))

    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    var g = grapho
        .selectAll(".arctext")
        .data(piePrint(dataPie))
        .enter()
        .append("g")
        .attr("class", "arctext");

    g.append("text")
        .attr("dy", ".35em")
        .attr("transform", function (d) {
            var pos = outerArcPrint.centroid(d);
            pos[0] = radiusPrint * (midAngle(d) < Math.PI ? 1 : -1);
            return "translate(" + pos + ")";
        })
        .attr("text-anchor", function (d) {
            return midAngle(d) < Math.PI ? "start" : "end";
        })
        .text(function (d, i) {
            if (dataPiePorcentajes[i] > 5) {
                return parseFloat(dataPiePorcentajes[i].toFixed(1)).toLocaleString("de-De") + "%";
            }
        });

    var g = grapho
        .selectAll(".polytext")
        .data(piePrint(dataPie))
        .enter()
        .append("g")
        .attr("class", "polytext");

    g.append("polyline")
        .attr("points", function (d, i) {
            if (dataPiePorcentajes[i] > 5) {
                var pos = outerArcPrint.centroid(d);
                pos[0] = radiusPrint * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                return [arcPrint.centroid(d), outerArcPrint.centroid(d), pos];
            }
            else {
                return "0,0,0,0";
            }
        })
        .attr("stroke-width", "2px")
        .attr("stroke", "#B5B5B5")
        .attr("fill", "none");

    svgPrint.append("g")
        .attr("transform", "translate(" + 0 + "," + ((radiusPrint * 2) + 40) + ")")
        .append("text")
        .attr("class", "legend__name")
        .attr("x", 50)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr('font-size', '0.8em')
        .attr('font-weight', '500')
        .text("Total: " + totalPie.toLocaleString("de-DE") + " " + getUnidades(varVariable));

    var legend = svgPrint.append("g")
        .attr("transform", "translate(" + widthPrint / 2 + "," + ((radiusPrint * 2) + 60) + ")")
        .attr("class", "legend");

    legend.selectAll('g')
        .data(dataPie)
        .enter()
        .append('g')
        .each(function (d, i) {
            var g = d3.select(this);
            g.append("rect")
                .attr("x", function () {
                    return -widthPrint / 2 + 50;
                })
                .attr("y", function () {
                    return (i * 20);
                })
                .attr("width", 10)
                .attr("height", 10)
                .attr("class", "legend__square")
                .style("fill", colores[i]);

            g.append("text")
                .attr("x", function () {
                    return -widthPrint / 2 + 70;
                })
                .attr("y", function () {
                    return 10 + (i * 20);
                })
                .attr("height", 30)
                .attr("width", 100)
                .attr("class", "legend__name")
                .text(function (d) {
                    return variablesNombreArreglo[i];
                });
        });
}
// */

//* Visualizazión de Dona 
function loadDona(data) {
    var dataPie = [];
    var dataPiePorcentajes = [];
    var totalPie = 0;
    var variablesArreglo = [];
    var variablesFiltroArreglo = [];
    var variablesNombreArreglo = [];

    for (var a = 0; a < listaVariables.length; a++) {
        if (varSubtema == listaVariables[a][0].substring(0, 5)) {
            variablesArreglo.push(listaVariables[a][1]);
            variablesFiltroArreglo.push(listaFilterVariables[a][1]);
            variablesNombreArreglo.push(listaNombresVariables[a][1]);
        }
    }
    // c("variablesArreglo del Pie", variablesArreglo)
    // c("variablesFiltroArreglo del Pie", variablesFiltroArreglo)
    // c("variablesNombreArreglo del Pie", variablesNombreArreglo)

    for (var j = 0; j < variablesArreglo.length; j++) {
        dataPie.push(0);
        dataPiePorcentajes.push(0);
    }
    var colores = []
    for (var a = 0; a < listaColores.length; a++) {
        var auxSubtema = listaColores[a][0].substring(0, 5)
        if (varSubtema == auxSubtema) {
            colores.push(chroma(listaColores[a][1].split(",")));
        }
    }

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < variablesArreglo.length; j++) {
            //if (data[i]["ANIO"] == $("#tiempoAnual").val()) {
            if (getNivelesFiltro() == "0") {
                if ($("#FiltroGeograficoLvl2").val() == "-1" || $("#FiltroGeograficoLvl1").val() == "-1") {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            }
                        }
                    }
                    else {
                        dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                        dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                        totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                    }
                }
                else {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (data[i]["CODIGO_F2"].length == 3) {
                                if ((data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                    dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                }
                            }
                            else {
                                if (data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                    dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                }
                            }
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                if (data[i]["CODIGO_F2"].length == 3) {
                                    if ((data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                        dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                        dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                        totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    }
                                }
                                else {
                                    if (data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                        dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                        dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                        totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (data[i]["CODIGO_F2"].length == 3) {
                            if ((data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            }
                        }
                        else {
                            if (data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                dataPie[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                dataPiePorcentajes[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                totalPie += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            }
                        }
                    }
                }

            } else {
                if ($("#FiltroGeograficoLvl2").val() == "-1" || $("#FiltroGeograficoLvl1").val() == "-1") {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j]) {
                                dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j]) {
                                    dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                                }
                            }
                        }

                    }
                    else {
                        if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j]) {
                            dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                            dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                            totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                        }
                    }
                }
                else {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (data[i]["CODIGO_F2"].length == 3) {
                                if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                    dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                                }
                            }
                            else {
                                if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                    dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                                }
                            }
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                if (data[i]["CODIGO_F2"].length == 3) {
                                    if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                        dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                        dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                        totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                                    }
                                }
                                else {
                                    if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                        dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                        dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                        totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (data[i]["CODIGO_F2"].length == 3) {
                            if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                        else {
                            if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                dataPie[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                dataPiePorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                    }
                }
            }
            // }
        }
    }

    for (var j = 0; j < dataPiePorcentajes.length; j++) {
        dataPiePorcentajes[j] = (dataPiePorcentajes[j] * 100) / totalPie;
    }

    if ($(".results__panel__graphs").width() == 0) {
        var width = $(".Geovisor__content").width() * 0.2 - 60;
    } else {
        var width = $(".results__panel__graphs").width();
    }
    var radius = (width * 0.6) / 2;
    var height = dataPie.length * 25 + (radius * 2.4) + 20;

    var arc = d3.svg.arc()
        .outerRadius(radius * 0.7)
        .innerRadius(20);

    var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 1.2);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d;
        });

    d3.select("#resultGraph").remove();
    var svg = d3.select(".results__panel__graphs")
        .append("svg")
        .attr("id", "resultGraph")
        .attr("class", "results__panel__graphs__pieGraph")
        .attr("width", width)
        .attr("height", height);

    var grapho = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + (radius + 30) + ")");

    var g = grapho
        .selectAll(".arc")
        .data(pie(dataPie))
        .enter()
        .append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function (d, i) {
            return colores[i];
        })
        .style("cursor", "pointer")
        .on("mouseover", function (d, i) {
            d3.select(".tooltip").remove();
            div = d3.select("body")
                .append("div")
                .attr("class", "tooltip");
        })
        .on("mousemove", function (d, i) {
            div.selectAll("text").remove();
            div.append("text")
                .html(variablesNombreArreglo[i] + ": " + d.data.toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + " (" + parseFloat(dataPiePorcentajes[i].toFixed(1)).toLocaleString("de-DE") + "%)");
            div.style("left", (d3.event.pageX - 100) + "px")
                .style("top", (d3.event.pageY + 40) + "px");
        })
        .on("mouseout", function (d, i) {
            div.remove();
        });

    var u = svg.selectAll("path")
        .data(pie(dataPie))
        .transition()
        .duration(1000)
        .attrTween("d", tweenPie)

    function tweenPie(b) {
        b.innerRadius = 0;
        var i = d3.interpolate({ startAngle: 0, endAngle: 0 }, b);
        return function (t) { return arc(i(t)); };
    }

    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    var g = grapho
        .selectAll(".arctext")
        .data(pie(dataPie))
        .enter()
        .append("g")
        .attr("class", "arctext");

    g.append("text")
        .attr("transform", function (d) {
            var pos = outerArc.centroid(d);
            pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
            return "translate(" + pos + ")";
        })
        .attr("text-anchor", function (d) {
            return midAngle(d) < Math.PI ? "start" : "end";
        })
        .text(function (d, i) {
            if (dataPiePorcentajes[i] > 5) {
                return parseFloat(dataPiePorcentajes[i].toFixed(1)).toLocaleString("de-DE") + "%";
            }
        });

    var g = grapho
        .selectAll(".polytext")
        .data(pie(dataPie))
        .enter()
        .append("g")
        .attr("class", "polytext");

    g.append("polyline")
        .attr("points", function (d, i) {
            if (dataPiePorcentajes[i] > 5) {
                var pos = outerArc.centroid(d);
                pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                return [arc.centroid(d), outerArc.centroid(d), pos];
            }
        });

    svg.append("g")
        .attr("transform", "translate(" + 0 + "," + ((radius * 2) + 40) + ")")
        .append("text")
        .attr("class", "legend__name")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr('font-size', '0.8em')
        .attr('font-weight', '500')
        .text("Total: " + totalPie.toLocaleString("de-DE") + " " + getUnidades(varVariable));

    var legend = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + ((radius * 2) + 60) + ")")
        .attr("class", "legend");

    legend.selectAll('g')
        .data(dataPie)
        .enter()
        .append('g')
        .each(function (d, i) {
            var g = d3.select(this);
            g.append("rect")
                .attr("x", function () {
                    return -width / 2;
                })
                .attr("y", function () {
                    return (i * 20);
                })
                .attr("width", 10)
                .attr("height", 10)
                .attr("class", "legend__square")
                .style("fill", colores[i]);

            g.append("text")
                .attr("x", function () {
                    return -width / 2 + 20;
                })
                .attr("y", function () {
                    return 10 + (i * 20);
                })
                .attr("height", 30)
                .attr("width", 100)
                .attr("class", "legend__name")
                .text(function (d) {
                    return variablesNombreArreglo[i];
                });
        });


    //TO PRINT
    if ($(".Modal__panel__graphs").width() == 0) {
        var widthPrint = $(".Geovisor__content").width() * 0.58;
    } else {
        var widthPrint = $(".Modal__panel__graphs").width();
    }
    var radiusPrint = (widthPrint * 0.6) / 2;
    var heightPrint = dataPie.length * 25 + (radiusPrint * 2.4) + 20;

    var arcPrint = d3.svg.arc()
        .outerRadius(radiusPrint * 0.7)
        .innerRadius(radiusPrint * 0.2);

    var outerArcPrint = d3.svg.arc()
        .innerRadius(radiusPrint * 0.9)
        .outerRadius(radiusPrint * 1.2);

    var piePrint = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d;
        });

    d3.select("#resultGraphPrint").remove();
    var svgPrint = d3.select(".Modal__panel__graphs")
        .append("svg")
        .attr("id", "resultGraphPrint")
        .attr("class", "Modal__panel__graphs__pieGraph")
        .attr("width", widthPrint)
        .attr("height", heightPrint);

    var grapho = svgPrint.append("g")
        .attr("transform", "translate(" + widthPrint / 2 + "," + (radiusPrint + 30) + ")");

    var g = grapho
        .selectAll(".arc")
        .data(piePrint(dataPie))
        .enter()
        .append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arcPrint)
        .style("fill", function (d, i) {
            return colores[i];
        })

    var u = svgPrint.selectAll("path")
        .data(piePrint(dataPie))

    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    var g = grapho
        .selectAll(".arctext")
        .data(piePrint(dataPie))
        .enter()
        .append("g")
        .attr("class", "arctext");

    g.append("text")
        .attr("dy", ".35em")
        .attr("transform", function (d) {
            var pos = outerArcPrint.centroid(d);
            pos[0] = radiusPrint * (midAngle(d) < Math.PI ? 1 : -1);
            return "translate(" + pos + ")";
        })
        .attr("text-anchor", function (d) {
            return midAngle(d) < Math.PI ? "start" : "end";
        })
        .text(function (d, i) {
            if (dataPiePorcentajes[i] > 5) {
                return parseFloat(dataPiePorcentajes[i].toFixed(1)).toLocaleString("de-De") + "%";
            }
        });

    var g = grapho
        .selectAll(".polytext")
        .data(piePrint(dataPie))
        .enter()
        .append("g")
        .attr("class", "polytext");

    g.append("polyline")
        .attr("points", function (d, i) {
            if (dataPiePorcentajes[i] > 5) {
                var pos = outerArcPrint.centroid(d);
                pos[0] = radiusPrint * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                return [arcPrint.centroid(d), outerArcPrint.centroid(d), pos];
            }
            else {
                return "0,0,0,0";
            }
        })
        .attr("stroke-width", "2px")
        .attr("stroke", "#B5B5B5")
        .attr("fill", "none");

    svgPrint.append("g")
        .attr("transform", "translate(" + 0 + "," + ((radiusPrint * 2) + 40) + ")")
        .append("text")
        .attr("class", "legend__name")
        .attr("x", 50)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr('font-size', '0.8em')
        .attr('font-weight', '500')
        .text("Total: " + totalPie.toLocaleString("de-DE") + " " + getUnidades(varVariable));

    var legend = svgPrint.append("g")
        .attr("transform", "translate(" + widthPrint / 2 + "," + ((radiusPrint * 2) + 60) + ")")
        .attr("class", "legend");

    legend.selectAll('g')
        .data(dataPie)
        .enter()
        .append('g')
        .each(function (d, i) {
            var g = d3.select(this);
            g.append("rect")
                .attr("x", function () {
                    return -widthPrint / 2 + 50;
                })
                .attr("y", function () {
                    return (i * 20);
                })
                .attr("width", 10)
                .attr("height", 10)
                .attr("class", "legend__square")
                .style("fill", colores[i]);

            g.append("text")
                .attr("x", function () {
                    return -widthPrint / 2 + 70;
                })
                .attr("y", function () {
                    return 10 + (i * 20);
                })
                .attr("height", 30)
                .attr("width", 100)
                .attr("class", "legend__name")
                .text(function (d) {
                    return variablesNombreArreglo[i];
                });
        });
}
// */

//* Visualización de Dona Clase 
function loadDonaClase(data) {
    var dataArray = [];
    var dataArrayPorcentajes = [];
    var totalPie = 0;
    var variablesAux = [];
    var variablesArreglo = [];
    var variableSeleccion;
    var variableFiltro;
    if (getTieneClase() == "S") {
        for (var i = 0; i < data.length; i++) {
            if (data[i]["CLASE"] != "0" && data[i]["CLASE"] != "") {
                variablesAux.push(data[i]["CLASE"])
            }
        }
    }

    for (var a = 0; a < listaVariables.length; a++) {
        if ($var.Map.varVariable == listaVariables[a][0]) {
            variableSeleccion = listaVariables[a][1];
            variableFiltro = listaFilterVariables[a][1];
        }
    }
    variablesAux = variablesAux.unique();

    for (var i = 0; i < variablesAux.length; i++) {
        variablesArreglo.push([variablesAux[i], getNombreClase(variablesAux[i])])
    }

    variablesArreglo = variablesArreglo.sort(function (a, b) {
        if (parseInt(a[0]) === parseInt(b[0])) {
            return 0;
        }
        else {
            return (parseInt(a[0]) < parseInt(b[0])) ? -1 : 1;
        }
    })

    //c(variablesArreglo)
    //c(variablesAux)

    if (getTipoDiv() == "VA") {
        var dataEntidades = []
        for (var i = 0; i < data.length; i++) {
            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                dataEntidades.push(data[i]["CODIGO_F1"]);
            }
            else {
                dataEntidades.push(data[i]["CODIGO_F2"]);
            }
        }
        dataEntidades = dataEntidades.unique();
        for (var i = 0; i < dataEntidades.length; i++) {
            dataArray.push([dataEntidades[i], []]);
            for (var j = 0; j < variablesArreglo.length; j++) {
                dataArray[i][1].push(0);
            }
        }
    } else {
        for (var j = 0; j < variablesArreglo.length; j++) {
            dataArray.push(0);
            dataArrayPorcentajes.push(0);
        }
    }
    if (variablesArreglo.length == 0) {
        if ($(".results__panel__dona").width() == 0) {
            var width = $(".Geovisor__content").width() * 0.2 - 60;
        }
        else {
            var width = $(".results__panel__dona").width();
        }
        var height = 150;

        d3.select("#resultDonaClases").remove();
        var svg = d3.select(".results__panel__dona")
            .append("svg")
            .attr("id", "resultDonaClases")
            .attr("class", "results__panel__dona__pieGraph")
            .attr("width", width)
            .attr("height", height);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr('fill', '#666')
            .attr('font-size', '12px')
            .attr("text-anchor", "middle")
            .text("No hay información");

        $(".Modal__panel__dona").prev().hide();
        $(".Modal__panel__dona").hide();
    } else {
        $(".Modal__panel__dona").prev().show();
        $(".Modal__panel__dona").show();

        if (getTipoDiv() == "VA") {
            for (var i = 0; i < data.length; i++) {
                //if (data[i]["ANIO"] == $("#tiempoAnual").val()) {
                for (var k = 0; k < dataEntidades.length; k++) {
                    if ($("#FiltroGeograficoLvl1").val() == "-1") {
                        if (data[i]["CODIGO_F1"] == dataEntidades[k]) {
                            for (var j = 0; j < variablesArreglo.length; j++) {
                                if (data[i]["CLASE"] == variablesArreglo[j][0]) {
                                    if (getNivelesFiltro() == "0") {
                                        dataArray[k][1][j] += parseFloat(getNumber(data[i][variableSeleccion]))
                                        dataArrayPorcentajes.push(parseFloat(getNumber(data[i][variableSeleccion])))
                                    }
                                    else {
                                        dataArray[k][1][j] += parseFloat(getNumber(data[i]["VALOR"]))
                                        dataArrayPorcentajes.push(parseFloat(getNumber(data[i]["VALOR"])))
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (data[i]["CODIGO_F2"] == dataEntidades[k]) {
                            for (var j = 0; j < variablesArreglo.length; j++) {
                                if (data[i]["CLASE"] == variablesArreglo[j][0]) {
                                    if (getNivelesFiltro() == "0") {
                                        dataArray[k][1][j] += parseFloat(getNumber(data[i][variableSeleccion]))
                                        dataArrayPorcentajes.push(parseFloat(getNumber(data[i][variableSeleccion])))
                                    }
                                    else {
                                        dataArray[k][1][j] += parseFloat(getNumber(data[i]["VALOR"]))
                                        dataArrayPorcentajes.push(parseFloat(getNumber(data[i]["VALOR"])))
                                    }
                                }
                            }
                        }
                    }
                }
                //}
            }

            dataArray.sort(function (a, b) {
                if (a[1][0] === b[1][0]) {
                    return 0;
                } else {
                    return (a[1][0] > b[1][0]) ? 1 : -1;
                }
            })

            var colores = ["#C891FF", "#34C0AF", "#34C0AF", '#BFBFBF']

            var heightBarras = 15 * dataArray.length;
            var height = heightBarras + 60;
            var margin = { top: 5, right: 40, bottom: 5, left: 130 };
            if ($(".results__panel__dona").width() == 0) {
                var width = $(".Geovisor__content").width() * 0.2 - 20 - margin.left - margin.right;
            }
            else {
                var width = $(".results__panel__dona").width() - margin.left - margin.right;
            }

            var max = d3.max(dataArrayPorcentajes) + (d3.max(dataArrayPorcentajes) * 0.1);


            var y0 = d3.scale.ordinal()
                .rangeRoundBands([heightBarras, 0], .1);

            var y1 = d3.scale.ordinal();

            var x = d3.scale.linear()
                .range([0, width]);

            var yAxis = d3.svg.axis()
                .scale(y0)
                .orient("left")
                .tickFormat(function (d, i) {
                    if ($("#FiltroGeograficoLvl1").val() == "-1") {
                        return getDepartamento(d);
                    }
                    else {
                        return getMpio(d);
                    }
                });

            var xAxis = d3.svg.axis()
                .scale(x)
                .tickSize(0)
                .orient("bottom");

            d3.select("#resultDonaClases").remove();
            var svg = d3.select(".results__panel__dona")
                .append("svg")
                .attr("id", "resultDonaClases")
                .attr("class", "results__panel__dona__pieGraph")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            y0.domain(dataArray.map(function (d, i) { return d[0]; }));
            y1.domain(variablesArreglo.map(function (d, i) { return i; })).rangeRoundBands([0, y0.rangeBand()]);
            x.domain([0, max]);

            // svg.append("g")
            //     .attr("class", "x axis")
            //     .attr("transform", "translate(0," + height + ")")
            //     .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .style("font-size", "0.9em")
                .call(yAxis)
                .selectAll(".tick text")
                .call(wrap, margin.left);

            var slice = svg.selectAll(".slice")
                .data(dataArray)
                .enter().append("g")
                .attr("class", "g")
                .attr("transform", function (d) { return "translate(0," + y0(d[0]) + ")"; });

            slice.selectAll("rect")
                .data(function (d) {
                    return d[1];
                })
                .enter()
                .append("rect")
                .attr("height", y1.rangeBand())
                .attr("y", function (d, i) {
                    return y1(i);
                })
                .style("fill", function (d, i) { return colores[i] })
                .attr("x", function (d) {
                    return 0;
                })
                .attr("width", function (d, i) {
                    return 0;
                })
                .style("cursor", "pointer")
                .on("mouseover", function (d, i) {
                    d3.select(".tooltip").remove();
                    div = d3.select("body")
                        .append("div")
                        .attr("class", "tooltip");
                })
                .on("mousemove", function (d, i) {
                    div.selectAll("text").remove();
                    div.append("text")
                        .html(variablesArreglo[i][1] + ": " + d.toLocaleString("de-De") + " " + getUnidades(varVariable));
                    div.style("left", (d3.event.pageX - 100) + "px")
                        .style("top", (d3.event.pageY + 40) + "px");
                })
                .on("mouseout", function (d, i) {
                    div.remove();
                });

            slice.selectAll("rect")
                .transition()
                .duration(1000)
                .delay(function (d, i) {
                    return i * 50;
                })
                .attr("width", function (d, i) {
                    return x(d);
                });

            var legend = svg.append("g")
                .attr("transform", "translate(" + (-margin.left) + "," + (heightBarras + 10) + ")")
                .attr("class", "legend");

            legend.selectAll('g')
                .data(variablesArreglo)
                .enter()
                .append('g')
                .each(function (d, i) {
                    var g = d3.select(this);
                    g.append("rect")
                        .attr("x", function () {
                            return 0;
                        })
                        .attr("y", function () {
                            return (i * 20);
                        })
                        .attr("width", 10)
                        .attr("height", 10)
                        .attr("class", "legend__square")
                        .style("fill", colores[i]);

                    g.append("text")
                        .attr("x", function () {
                            return 20;
                        })
                        .attr("y", function () {
                            return 10 + (i * 20);
                        })
                        .attr("height", 30)
                        .attr("width", 100)
                        .attr("class", "legend__name")
                        .text(function (d) {
                            return variablesArreglo[i][1];
                        });
                });

            //TO PRINT

            var heightBarrasPrint = 30 * dataArray.length;
            var heightPrint = heightBarrasPrint + 60;
            if ($(".Modal__panel__dona").width() == 0) {
                var widthPrint = $(".PrintModal").width() * 0.58 - margin.left - margin.right;
            }
            else {
                var widthPrint = $(".Modal__panel__dona").width() - margin.left - margin.right;
            }
            var y0Print = d3.scale.ordinal()
                .rangeRoundBands([heightBarrasPrint, 0], .1);

            var y1Print = d3.scale.ordinal();

            var xPrint = d3.scale.linear()
                .range([0, widthPrint]);

            var yAxisPrint = d3.svg.axis()
                .scale(y0Print)
                .orient("left")
                .tickFormat(function (d, i) {
                    if ($("#FiltroGeograficoLvl1").val() == "-1") {
                        return getDepartamento(d);
                    }
                    else {
                        return getMpio(d);
                    }
                });

            var xAxisPrint = d3.svg.axis()
                .scale(xPrint)
                .tickSize(0)
                .orient("bottom");

            d3.select("#resultDonaClases").remove();
            var svg = d3.select(".results__panel__dona")
                .append("svg")
                .attr("id", "resultDonaClases")
                .attr("class", "results__panel__dona__pieGraph")
                .attr("width", widthPrint + margin.left + margin.right)
                .attr("height", heightPrint + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            y0Print.domain(dataArray.map(function (d, i) { return d[0]; }));
            y1Print.domain(variablesArreglo.map(function (d, i) { return i; })).rangeRoundBands([0, y0Print.rangeBand()]);
            xPrint.domain([0, max]);

            svg.append("g")
                .attr("class", "y axis")
                .style("font-size", "0.9em")
                .call(yAxisPrint)
                .selectAll(".tick text")
                .call(wrap, margin.left);

            var slice = svg.selectAll(".slice")
                .data(dataArray)
                .enter().append("g")
                .attr("class", "g")
                .attr("transform", function (d) { return "translate(0," + y0Print(d[0]) + ")"; });

            slice.selectAll("rect")
                .data(function (d) {
                    return d[1];
                })
                .enter()
                .append("rect")
                .attr("height", y1Print.rangeBand())
                .attr("y", function (d, i) {
                    return y1Print(i);
                })
                .style("fill", function (d, i) { return colores[i] })
                .attr("x", function (d) {
                    return 0;
                })
                .attr("width", function (d, i) {
                    return xPrint(d);
                })


            var legend = svg.append("g")
                .attr("transform", "translate(" + (-margin.left) + "," + (heightBarrasPrint + 10) + ")")
                .attr("class", "legend");

            legend.selectAll('g')
                .data(variablesArreglo)
                .enter()
                .append('g')
                .each(function (d, i) {
                    var g = d3.select(this);
                    g.append("rect")
                        .attr("x", function () {
                            return 0;
                        })
                        .attr("y", function () {
                            return (i * 20);
                        })
                        .attr("width", 10)
                        .attr("height", 10)
                        .attr("class", "legend__square")
                        .style("fill", colores[i]);

                    g.append("text")
                        .attr("x", function () {
                            return 20;
                        })
                        .attr("y", function () {
                            return 10 + (i * 20);
                        })
                        .attr("height", 30)
                        .attr("width", 100)
                        .attr("class", "legend__name")
                        .text(function (d) {
                            return variablesArreglo[i][1];
                        });
                });

            function wrap(text, width) {
                text.each(function () {
                    var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1, // ems
                        y = text.attr("y"),
                        dy = parseFloat(text.attr("dy")),
                        tspan = text.text(null).append("tspan").attr("x", -9).attr("y", y).attr("dy", dy + "em");
                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (tspan.node().getComputedTextLength() > width) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan").attr("x", -9).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                        }
                    }
                });
            }
        }
        else {
            for (var i = 0; i < data.length; i++) {
                //if (data[i]["ANIO"] == $("#tiempoAnual").val()) {
                for (var j = 0; j < variablesArreglo.length; j++) {
                    if (data[i]["CLASE"] == variablesArreglo[j][0]) {
                        if (getNivelesFiltro() == "0") {
                            dataArray[j] += parseFloat(getNumber(data[i][variableSeleccion]))
                            dataArrayPorcentajes[j] += parseFloat(getNumber(data[i][variableSeleccion]))
                            totalPie += parseFloat(getNumber(data[i][variableSeleccion]))
                        }
                        else {
                            if (data[i][variableFiltro] == variableSeleccion) {
                                dataArray[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                dataArrayPorcentajes[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                totalPie += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                    }
                }
                // }
            }
            for (var j = 0; j < dataArrayPorcentajes.length; j++) {
                dataArrayPorcentajes[j] = (dataArrayPorcentajes[j] * 100) / totalPie;
            }

            // c(dataArray)
            // c(dataArrayPorcentajes)

            var colores = ["#C891FF", "#FFCC00", "#34C0AF", '#BFBFBF']

            if ($(".results__panel__dona").width() == 0) {
                var width = $(".Geovisor__content").width() * 0.2 - 60;
            }
            else {
                var width = $(".results__panel__dona").width();
            }
            var radius = (width * 0.6) / 2;
            var height = dataArray.length * 25 + (radius * 2.4) + 20;

            var arc = d3.svg.arc()
                .outerRadius(radius * 0.8)
                .innerRadius(20);

            var outerArc = d3.svg.arc()
                .innerRadius(radius * 0.9)
                .outerRadius(radius * 1.2);

            var pie = d3.layout.pie()
                .sort(null)
                .value(function (d) {
                    return d;
                });

            d3.select("#resultDonaClases").remove();
            var svg = d3.select(".results__panel__dona")
                .append("svg")
                .attr("id", "resultDonaClases")
                .attr("class", "results__panel__dona__pieGraph")
                .attr("width", width)
                .attr("height", height);

            var grapho = svg.append("g")
                .attr("transform", "translate(" + width / 2 + "," + (radius + 30) + ")");

            var g = grapho
                .selectAll(".arc")
                .data(pie(dataArray))
                .enter()
                .append("g")
                .attr("class", "arc");

            g.append("path")
                .attr("d", arc)
                .style("fill", function (d, i) {
                    return colores[i];
                })
                .style("cursor", "pointer")
                .on("mouseover", function (d, i) {
                    d3.select(".tooltip").remove();
                    div = d3.select("body")
                        .append("div")
                        .attr("class", "tooltip");
                })
                .on("mousemove", function (d, i) {
                    div.selectAll("text").remove();
                    div.append("text")
                        .html(variablesArreglo[i][1] + ": " + d.data.toLocaleString("de-De") + " " + getUnidades(varVariable));
                    div.style("left", (d3.event.pageX - 100) + "px")
                        .style("top", (d3.event.pageY + 40) + "px");
                })
                .on("mouseout", function (d, i) {
                    div.remove();
                });

            var u = svg.selectAll("path")
                .data(pie(dataArray))
                .transition()
                .duration(1000)
                .attrTween("d", tweenPie)

            function tweenPie(b) {
                b.innerRadius = 0;
                var i = d3.interpolate({ startAngle: 0, endAngle: 0 }, b);
                return function (t) { return arc(i(t)); };
            }

            function midAngle(d) {
                return d.startAngle + (d.endAngle - d.startAngle) / 2;
            }

            var g = grapho
                .selectAll(".arctext")
                .data(pie(dataArray))
                .enter()
                .append("g")
                .attr("class", "arctext");

            g.append("text")
                .attr("transform", function (d) {
                    var pos = outerArc.centroid(d);
                    pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1) + 5;
                    return "translate(" + pos + ")";
                })
                .attr("dy", "0.32em")
                .attr("text-anchor", function (d) {
                    return midAngle(d) < Math.PI ? "start" : "end";
                })
                .text(function (d, i) {
                    if (dataArrayPorcentajes[i] > 2) {
                        return parseFloat(dataArrayPorcentajes[i].toFixed(1)).toLocaleString("de-DE") + "%";
                    }
                });

            var g = grapho
                .selectAll(".polytext")
                .data(pie(dataArray))
                .enter()
                .append("g")
                .attr("class", "polytext");

            g.append("polyline")
                .attr("points", function (d, i) {
                    if (dataArrayPorcentajes[i] > 2) {
                        var pos = outerArc.centroid(d);
                        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                        return [arc.centroid(d), outerArc.centroid(d), pos];
                    }
                });

            var legend = svg.append("g")
                .attr("transform", "translate(" + width / 2 + "," + (((radius * 0.8) * 2)) + ")")
                .attr("class", "legend");

            legend.selectAll('g')
                .data(dataArray)
                .enter()
                .append('g')
                .each(function (d, i) {
                    var g = d3.select(this);
                    g.append("rect")
                        .attr("x", function () {
                            return -width / 2;
                        })
                        .attr("y", function () {
                            return radius + (i * 20);
                        })
                        .attr("width", 10)
                        .attr("height", 10)
                        .attr("class", "legend__square")
                        .style("fill", colores[i]);

                    g.append("text")
                        .attr("x", function () {
                            return -width / 2 + 20;
                        })
                        .attr("y", function () {
                            return radius + 10 + (i * 20);
                        })
                        .attr("height", 30)
                        .attr("width", 100)
                        .attr("class", "legend__name")
                        .text(function (d) {
                            return variablesArreglo[i][1];
                        });
                });

            //TO PRINT
            if ($(".Modal__panel__dona").width() == 0) {
                var widthPrint = $(".PrintModal").width() * 0.58;
            }
            else {
                var widthPrint = $(".Modal__panel__dona").width();
            }
            var radiusPrint = (widthPrint * 0.6) / 2;
            var heightPrint = dataArray.length * 25 + (radiusPrint * 2.4) + 20;

            var arcPrint = d3.svg.arc()
                .outerRadius(radiusPrint * 0.8)
                .innerRadius(radiusPrint * 0.2);

            var outerArcPrint = d3.svg.arc()
                .innerRadius(radiusPrint * 0.9)
                .outerRadius(radiusPrint * 1.2);

            var piePrint = d3.layout.pie()
                .sort(null)
                .value(function (d) {
                    return d;
                });

            d3.select("#resultDonaClasesPrint").remove();
            var svg = d3.select(".Modal__panel__dona")
                .append("svg")
                .attr("id", "resultDonaClasesPrint")
                .attr("class", "Modal__panel__dona__pieGraph")
                .attr("width", widthPrint)
                .attr("height", heightPrint);

            var grapho = svg.append("g")
                .attr("transform", "translate(" + widthPrint / 2 + "," + (radiusPrint + 30) + ")");

            var g = grapho
                .selectAll(".arc")
                .data(piePrint(dataArray))
                .enter()
                .append("g")
                .attr("class", "arc");

            g.append("path")
                .attr("d", arcPrint)
                .style("fill", function (d, i) {
                    return colores[i];
                })

            function midAngle(d) {
                return d.startAngle + (d.endAngle - d.startAngle) / 2;
            }

            var g = grapho
                .selectAll(".arctext")
                .data(piePrint(dataArray))
                .enter()
                .append("g")
                .attr("class", "arctext");

            g.append("text")
                .attr("transform", function (d) {
                    var pos = outerArcPrint.centroid(d);
                    pos[0] = radiusPrint * (midAngle(d) < Math.PI ? 1 : -1) + 5;
                    return "translate(" + pos + ")";
                })
                .attr("dy", "0.32em")
                .attr("text-anchor", function (d) {
                    return midAngle(d) < Math.PI ? "start" : "end";
                })
                .text(function (d, i) {
                    if (dataArrayPorcentajes[i] > 2) {
                        return parseFloat(dataArrayPorcentajes[i].toFixed(1)).toLocaleString("de-DE") + "%";
                    }
                });

            var g = grapho
                .selectAll(".polytext")
                .data(piePrint(dataArray))
                .enter()
                .append("g")
                .attr("class", "polytext");

            g.append("polyline")
                .attr("points", function (d, i) {
                    if (dataArrayPorcentajes[i] > 2) {
                        var pos = outerArcPrint.centroid(d);
                        pos[0] = radiusPrint * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                        return [arcPrint.centroid(d), outerArcPrint.centroid(d), pos];
                    }
                    else {
                        return "0,0,0,0";
                    }
                })
                .attr("stroke-width", "2px")
                .attr("stroke", "#B5B5B5")
                .attr("fill", "none");

            var legend = svg.append("g")
                .attr("transform", "translate(" + widthPrint / 2 + "," + (((radiusPrint * 0.8) * 2)) + ")")
                .attr("class", "legend");

            legend.selectAll('g')
                .data(dataArray)
                .enter()
                .append('g')
                .each(function (d, i) {
                    var g = d3.select(this);
                    g.append("rect")
                        .attr("x", function () {
                            return -widthPrint / 2 + 50;
                        })
                        .attr("y", function () {
                            return radiusPrint + (i * 20);
                        })
                        .attr("width", 10)
                        .attr("height", 10)
                        .attr("class", "legend__square")
                        .style("fill", colores[i]);

                    g.append("text")
                        .attr("x", function () {
                            return -widthPrint / 2 + 70;
                        })
                        .attr("y", function () {
                            return radiusPrint + 10 + (i * 20);
                        })
                        .attr("height", 30)
                        .attr("width", 100)
                        .attr("class", "legend__name")
                        .text(function (d) {
                            return variablesArreglo[i][1];
                        });
                });
        }
    }
}

function loadBarsEntidades(data) {
    // c(data)
    var totalData = 0;
    var arrayDatos = [];
    var arrayNumber = [];
    var tipoDiv = "VA";
    var variableNombre = "";
    var variableFiltro = "";
    var variableSeleccion = "";
    var listaEntidadesG = [];
    var variablesArreglo = [];
    var variablesFiltroArreglo = [];
    var variablesNombreArreglo = [];


    tipoDiv = getTipoDiv();

    for (var i = 0; i < listaVariables.length; i++) {
        if (listaVariables[i][0].substring(0, 5) == varSubtema) {
            variablesArreglo.push(listaVariables[i][1]);
            variablesFiltroArreglo.push(listaFilterVariables[i][1]);
            variablesNombreArreglo.push(listaNombresVariables[i][1]);
        }
        if (listaVariables[i][0] == $var.Map.varVariable) {
            variableSeleccion = listaVariables[i][1]
            variableFiltro = listaFilterVariables[i][1]
            variableNombre = listaNombresVariables[i][1]
        }
    }

    variablesArreglo = variablesArreglo.unique();
    variablesFiltroArreglo = variablesFiltroArreglo.unique();
    variablesNombreArreglo = variablesNombreArreglo.unique();

    for (var j = 0; j < data.length; j++) {
        if (data[j]["ANIO"] == $("#tiempoAnual").val()) {
            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                if (typeMapDivision == 0) {
                    listaEntidadesG.push(data[j]["CODIGO_F1"]);
                } else {
                    listaEntidadesG.push(data[j]["CODIGO_F2"]);
                }
            }
            else {
                listaEntidadesG.push(data[j]["CODIGO_F2"]);
            }
            // TODO OTRA ENTIDAD GEOGRÁFICA
        }
    }
    listaEntidadesG = listaEntidadesG.unique();

    for (var j = 0; j < listaEntidadesG.length; j++) {
        arrayDatos.push([listaEntidadesG[j], 0, "#11A18D"]);
        arrayNumber.push(0)
    }

    for (var k = 0; k < arrayDatos.length; k++) {
        for (var i = 0; i < data.length; i++) {
            // if (data[i]["ANIO"] == $("#tiempoAnual").val()) {
            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                if (typeMapDivision == 0) {
                    if (arrayDatos[k][0] == data[i]["CODIGO_F1"]) {
                        if (getTieneClase() == "S") {
                            if (getClase() == "0") {
                                if (getNivelesFiltro() == "0") {
                                    for (var p = 0; p < variablesArreglo.length; p++) {
                                        if (variablesArreglo[p] == variableSeleccion) {
                                            arrayDatos[k][1] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                            arrayNumber[k] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                            totalData += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                        }
                                    }
                                }
                                else {
                                    for (var p = 0; p < variablesArreglo.length; p++) {
                                        if (data[i][variablesFiltroArreglo[p]] == variableSeleccion) {
                                            arrayDatos[k][1] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                            arrayNumber[k] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                            totalData += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                        }
                                    }
                                }
                            }
                            else {
                                if (data[i]["CLASE"] == getClase()) {
                                    if (getNivelesFiltro() == "0") {
                                        for (var p = 0; p < variablesArreglo.length; p++) {
                                            if (variablesArreglo[p] == variableSeleccion) {
                                                arrayDatos[k][1] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                                arrayNumber[k] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                                totalData += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                            }
                                        }
                                    }
                                    else {
                                        for (var p = 0; p < variablesArreglo.length; p++) {
                                            if (data[i][variablesFiltroArreglo[p]] == variableSeleccion) {
                                                arrayDatos[k][1] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                                arrayNumber[k] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                                totalData += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            if (getNivelesFiltro() == "0") {
                                for (var p = 0; p < variablesArreglo.length; p++) {
                                    if (variablesArreglo[p] == variableSeleccion) {
                                        arrayDatos[k][1] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                        arrayNumber[k] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                        totalData += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                    }
                                }
                            }
                            else {
                                for (var p = 0; p < variablesArreglo.length; p++) {
                                    if (data[i][variablesFiltroArreglo[p]] == variableSeleccion) {
                                        arrayDatos[k][1] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                        arrayNumber[k] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                        totalData += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    if (arrayDatos[k][0] == data[i]["CODIGO_F2"]) {
                        if (getTieneClase() == "S") {
                            if (getClase() == "0") {
                                if (getNivelesFiltro() == "0") {
                                    for (var p = 0; p < variablesArreglo.length; p++) {
                                        if (variablesArreglo[p] == variableSeleccion) {
                                            arrayDatos[k][1] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                            arrayNumber[k] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                            totalData += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                        }
                                    }
                                }
                                else {
                                    for (var p = 0; p < variablesArreglo.length; p++) {
                                        if (data[i][variablesFiltroArreglo[p]] == variableSeleccion) {

                                            arrayDatos[k][1] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                            arrayNumber[k] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                            totalData += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                        }
                                    }
                                }
                            }
                            else {
                                if (data[i]["CLASE"] == getClase()) {
                                    if (getNivelesFiltro() == "0") {
                                        for (var p = 0; p < variablesArreglo.length; p++) {
                                            if (variablesArreglo[p] == variableSeleccion) {
                                                arrayDatos[k][1] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                                arrayNumber[k] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                                totalData += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                            }
                                        }
                                    }
                                    else {
                                        for (var p = 0; p < variablesArreglo.length; p++) {
                                            if (data[i][variablesFiltroArreglo[p]] == variableSeleccion) {
                                                arrayDatos[k][1] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                                arrayNumber[k] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                                totalData += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            if (getNivelesFiltro() == "0") {
                                for (var p = 0; p < variablesArreglo.length; p++) {
                                    if (variablesArreglo[p] == variableSeleccion) {
                                        arrayDatos[k][1] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                        arrayNumber[k] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                        totalData += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                    }
                                }
                            }
                            else {
                                for (var p = 0; p < variablesArreglo.length; p++) {
                                    if (data[i][variablesFiltroArreglo[p]] == variableSeleccion) {
                                        arrayDatos[k][1] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                        arrayNumber[k] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                        totalData += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if (arrayDatos[k][0] == data[i]["CODIGO_F2"]) {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (getNivelesFiltro() == "0") {
                                for (var p = 0; p < variablesArreglo.length; p++) {
                                    if (variablesArreglo[p] == variableSeleccion) {
                                        arrayDatos[k][1] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                        arrayNumber[k] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                        totalData += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                    }
                                }
                            }
                            else {
                                for (var p = 0; p < variablesArreglo.length; p++) {
                                    if (data[i][variablesFiltroArreglo[p]] == variableSeleccion) {
                                        arrayDatos[k][1] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                        arrayNumber[k] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                        totalData += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                    }
                                }
                            }
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                if (getNivelesFiltro() == "0") {
                                    for (var p = 0; p < variablesArreglo.length; p++) {
                                        if (variablesArreglo[p] == variableSeleccion) {
                                            arrayDatos[k][1] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                            arrayNumber[k] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                            totalData += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                        }
                                    }
                                }
                                else {
                                    for (var p = 0; p < variablesArreglo.length; p++) {
                                        if (data[i][variablesFiltroArreglo[p]] == variableSeleccion) {
                                            arrayDatos[k][1] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                            arrayNumber[k] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                            totalData += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (getNivelesFiltro() == "0") {
                            for (var p = 0; p < variablesArreglo.length; p++) {
                                if (variablesArreglo[p] == variableSeleccion) {
                                    arrayDatos[k][1] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                    arrayNumber[k] += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                    totalData += parseFloat(getNumber(data[i][variablesArreglo[p]]).replace(",", "."))
                                }
                            }
                        }
                        else {
                            for (var p = 0; p < variablesArreglo.length; p++) {
                                if (data[i][variablesFiltroArreglo[p]] == variableSeleccion) {
                                    arrayDatos[k][1] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                    arrayNumber[k] += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                    totalData += parseFloat(getNumber(data[i]["VALOR"]).replace(",", "."))
                                }
                            }
                        }
                    }
                }
            }
            // }
        }
    }

    //c(arrayDatos)
    // c(listaDivipolaMpios)
    // c(totalData)

    if (tipoDiv != "VA") {
        for (var j = 0; j < arrayDatos.length; j++) {
            arrayDatos[j][1] = 100 * arrayDatos[j][1] / totalData
            arrayNumber[j] = 100 * arrayNumber[j] / totalData
        }
    }

    arrayDatos.sort(function (a, b) {
        if (a[1] === b[1]) {
            return 0;
        }
        else {
            return (a[1] > b[1]) ? -1 : 1;
        }
    })

    var height = 25 * arrayDatos.length;
    var margin = { top: 0, right: 40, bottom: 5, left: 130 };
    if ($(".results__panel__participacion").width() == 0) {
        var width = $(".Geovisor__content").width() * 0.2 - 20 - margin.left - margin.right;
    } else {
        var width = $(".results__panel__participacion").width() - margin.left - margin.right;
    }
    var max = d3.max(arrayNumber) + (d3.max(arrayNumber) * 0.1);
    var x = d3.scale.linear().domain([0, max]).range([0, width]);
    var y = d3.scale.ordinal().rangeRoundBands([0, height], 0.1, 0);

    y.domain(arrayDatos.map(function (d) {
        return d[0];
    }));


    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(function (d, i) {
            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                if (typeMapDivision == 0) {
                    return getDepartamento(d);
                } else {
                    return getMpio(d);
                }
            }
            else {
                return getMpio(d);
            }
        });

    d3.select("#participationGraph").remove();
    var svg = d3.select(".results__panel__participacion")
        .append("svg")
        .attr("id", "participationGraph")
        .attr("class", "results__panel__participacion__pieGraph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 40)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    svg.append("g")
        .attr("class", "y axis")
        .style("font-size", "0.75em")
        .call(yAxis)
        .selectAll(".tick text")
        // .attr("dy", "-0.5em")
        .call(wrap, margin.left);

    svg.selectAll("rect")
        .data(arrayDatos)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return 0;
        })
        .attr("y", function (d) {
            return y(d[0]);
        })
        .attr("width", function (d) {
            return 0;
        })
        .attr("height", function (d) {
            return y.rangeBand();
        })
        .attr('stroke-width', 1)
        .style("fill", function (d, i) {
            return d[2];
        })
        .style("cursor", "pointer")
        .on("mouseover", function (d, i) {
            var codigoValor = d[0]
            d3.select(".tooltip").remove();
            div = d3.select("body")
                .append("div")
                .attr("class", "tooltip");

            $(this).attr("stroke", "cyan")
            $(this).attr("stroke-width", "1")


            $var.Map.layers.layerDatos.forEach(function (feature) {
                if ($("#FiltroGeograficoLvl1").val() == "-1") {
                    if (typeMapDivision == 0) {
                        if (feature.getProperty("DPTO_CCDGO") == codigoValor) {
                            $var.Map.layers.layerDatos.overrideStyle(feature, { strokeColor: "cyan", strokeWeight: 4 })
                        }
                    }
                    else {
                        if (feature.getProperty("MPIO_CCNCT") == codigoValor) {
                            $var.Map.layers.layerDatos.overrideStyle(feature, { strokeColor: "cyan", strokeWeight: 4 })
                        }
                    }
                } else {
                    if (feature.getProperty("MPIO_CCNCT") == codigoValor) {
                        $var.Map.layers.layerDatos.overrideStyle(feature, { strokeColor: "cyan", strokeWeight: 4 })
                    }
                }
            });
        })
        .on("mousemove", function (d, i) {
            var dato = d[1]
            if (tipoDiv != "VA") {
                dato = (d[1] * totalData) / 100
            }
            div.selectAll("text").remove();
            div.append("text")
                .html(variableNombre + ": " + dato.toLocaleString("de-De") + " " + getUnidades(varVariable));
            div.style("left", (d3.event.pageX - 100) + "px")
                .style("top", (d3.event.pageY + 40) + "px");
        })
        .on("mouseout", function (d, i) {
            div.remove();

            $(this).attr("stroke", "black")
            $(this).attr("stroke-width", "0")

            $var.Map.layers.layerDatos.revertStyle();
        })
        .transition()
        .duration(1000)
        .delay(function (d, i) {
            return i * 50;
        })
        .attr("width", function (d, i) {
            return x(d[1]);
        });

    svg.selectAll(".totalTipo")
        .data(arrayDatos)
        .enter()
        .append("text")
        .attr("class", "totalTipo")
        .attr("x", function (d, i) {
            return x(d[1]) + 5;
        })
        .attr("y", function (d) {
            return y(d[0]) + y.rangeBand() / 2;
        })
        .attr("text-anchor", "start")
        .attr('dy', '0.3em')
        .style('font-size', '0.8em')
        .style('display', 'block')
        .text(function (d, i) {
            if (tipoDiv != "VA") {
                if (tipoDiv != "VA") {
                    dato = (d[1] * totalData) / 100
                }
                return parseFloat(dato.toFixed(1)).toLocaleString("de-DE");
            }
            else {
                return parseFloat(d[1].toFixed(1)).toLocaleString("de-DE");

            }
        });

    var heightPrint = 20 * arrayDatos.length;
    var margin = { top: 5, right: 40, bottom: 5, left: 180 };
    if ($(".Modal__panel__participacion").width() == 0) {
        var widthPrint = $(".PrintModal").width() * 0.58 - margin.left - margin.right;
    } else {
        var widthPrint = $(".Modal__panel__participacion").width() - margin.left - margin.right;
    }
    var xPrint = d3.scale.linear().domain([0, max]).range([0, widthPrint]);
    var yPrint = d3.scale.ordinal().rangeRoundBands([0, heightPrint], 0.1, 0);

    yPrint.domain(arrayDatos.map(function (d) {
        return d[0];
    }));


    var yAxisPrint = d3.svg.axis()
        .scale(yPrint)
        .orient("left")
        .tickFormat(function (d, i) {
            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                if (typeMapDivision == 0) {
                    return getDepartamento(d);
                } else {
                    return getMpio(d);
                }
            }
            else {
                return getMpio(d);
            }
        });

    d3.select("#participationGraphPrint").remove();
    var svg = d3.select(".Modal__panel__participacion")
        .append("svg")
        .attr("id", "participationGraphPrint")
        .attr("class", "Modal__panel__participacion__pieGraph")
        .attr("width", widthPrint + margin.left + margin.right)
        .attr("height", heightPrint + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top - 10) + ")");


    svg.append("g")
        .attr("class", "y axis")
        .style("font-size", "0.9em")
        .call(yAxisPrint)
        .selectAll(".axis path")
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .selectAll(".axis line")
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .selectAll(".tick text")
        .call(wrap, margin.left);

    svg.selectAll("rect")
        .data(arrayDatos)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return 0;
        })
        .attr("y", function (d) {
            return yPrint(d[0]);
        })
        .attr("width", function (d) {
            return xPrint(d[1]);
        })
        .attr("height", function (d) {
            return yPrint.rangeBand();
        })
        .attr('stroke-width', 1)
        .style("fill", function (d, i) {
            return d[2];
        })

    svg.selectAll(".totalTipo")
        .data(arrayDatos)
        .enter()
        .append("text")
        .attr("class", "totalTipo")
        .attr("x", function (d, i) {
            return xPrint(d[1]) + 5;
        })
        .attr("y", function (d) {
            return yPrint(d[0]) + yPrint.rangeBand() / 2;
        })
        .attr("text-anchor", "start")
        .attr('dy', '0.3em')
        .style('font-size', '0.6em')
        .style('display', 'block')
        .text(function (d, i) {
            if (tipoDiv != "VA") {
                return parseFloat(d[1].toFixed(1)).toLocaleString("de-DE") + "%";
            }
            else {
                return parseFloat(d[1].toFixed(1)).toLocaleString("de-DE");
            }
        });


    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", -9).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", -9).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }
}

function loadBarsH(data) { //Barras Verticales
    var arrayDatos = [];
    var arrayNumber = [];
    var totalData = 0;
    var variablesArreglo = [];
    var variablesNombreArreglo = [];
    var variablesArreglo = [];
    var variablesFiltroArreglo = [];
    var variablesNombreArreglo = [];

    for (var a = 0; a < listaVariables.length; a++) {
        if (varSubtema == listaVariables[a][0].substring(0, 5)) {
            variablesArreglo.push(listaVariables[a][1]);
            variablesFiltroArreglo.push(listaFilterVariables[a][1]);
            variablesNombreArreglo.push(listaNombresVariables[a][1]);
        }
    }

    for (var j = 0; j < variablesArreglo.length; j++) {
        arrayDatos.push([variablesNombreArreglo[j], 0, ""]);
        arrayNumber.push(0);
    }

    var colores = []
    for (var a = 0; a < listaColores.length; a++) {
        var auxSubtema = listaColores[a][0].substring(0, 5)
        if (varSubtema == auxSubtema) {
            colores.push(chroma(listaColores[a][1].split(",")));
        }
    }

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < variablesArreglo.length; j++) {
            //if (data[i]["ANIO"] == $("#tiempoAnual").val()) {
            if (getNivelesFiltro() == "0") {
                if ($("#FiltroGeograficoLvl2").val() == "-1" || $("#FiltroGeograficoLvl1").val() == "-1") {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            arrayDatos[j][1] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            arrayDatos[j][2] = colores[j]
                            arrayNumber[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                arrayDatos[j][2] = colores[j]
                                arrayNumber[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            }
                        }
                    }
                    else {
                        arrayDatos[j][1] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                        arrayDatos[j][2] = colores[j]
                        arrayNumber[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                    }
                }
                else {
                    if (getTieneClase() == "S") {
                        if (data[i]["CLASE"] == getClase()) {
                            if (data[i]["CODIGO_F2"].length == 3) {
                                if ((data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                    arrayDatos[j][1] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    arrayDatos[j][2] = colores[j]
                                    arrayNumber[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                }
                            }
                            else {
                                if (data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                    arrayDatos[j][1] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                    arrayDatos[j][2] = colores[j]
                                    arrayNumber[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                }
                            }
                        }
                    }
                    else {
                        if (data[i]["CODIGO_F2"].length == 3) {
                            if ((data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                arrayDatos[j][2] = colores[j]
                                arrayNumber[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            }
                        }
                        else {
                            if (data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                                arrayDatos[j][2] = colores[j]
                                arrayNumber[j] += parseFloat(getNumber(data[i][variablesArreglo[j]]))
                            }
                        }
                    }
                }
            } else {
                if ($("#FiltroGeograficoLvl2").val() == "-1" || $("#FiltroGeograficoLvl1").val() == "-1") {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j]) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                arrayDatos[j][2] = colores[j]
                                arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j]) {
                                    arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                    arrayDatos[j][2] = colores[j]
                                    arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                }
                            }
                        }

                    }
                    else {
                        if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j]) {
                            arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                            arrayDatos[j][2] = colores[j]
                            arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                        }
                    }
                }
                else {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (data[i]["CODIGO_F2"].length == 3) {
                                if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                    arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                    arrayDatos[j][2] = colores[j]
                                    arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                }
                            }
                            else {
                                if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                    arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                    arrayDatos[j][2] = colores[j]
                                    arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                }
                            }
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                if (data[i]["CODIGO_F2"].length == 3) {
                                    if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                        arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                        arrayDatos[j][2] = colores[j]
                                        arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    }
                                }
                                else {
                                    if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                        arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                        arrayDatos[j][2] = colores[j]
                                        arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (data[i]["CODIGO_F2"].length == 3) {
                            if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                arrayDatos[j][2] = colores[j]
                                arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                        else {
                            if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                arrayDatos[j][2] = colores[j]
                                arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                    }
                }
            }
            //}
        }
    }

    arrayDatos.sort(function (a, b) {
        if (a[1] === b[1]) {
            return 0;
        }
        else {
            return (a[1] > b[1]) ? -1 : 1;
        }
    })

    for (var i = 0; i < arrayNumber.length; i++) {
        totalData += arrayNumber[i];
    }

    var height = 250;
    var margin = { top: 10, right: 10, bottom: 180, left: 10 };
    if ($(".results__panel__graphs").width() == 0) {
        var width = $(".Geovisor__content").width() * 0.2 - 10 - margin.left - margin.right;
    } else {
        var width = $(".results__panel__graphs").width() - margin.left - margin.right;
    }
    var max = d3.max(arrayNumber) + (d3.max(arrayNumber) * 0.1);
    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
    var y = d3.scale.linear().domain([0, max]).range([height, 0]);

    var yAxis = d3.svg.axis()
        .orient("bottom")
        .scale(x)
        .tickFormat(function (d, i) {
            return d;
        });

    d3.select("#resultGraph").remove();
    var svg = d3.select(".results__panel__graphs")
        .append("svg")
        .attr("id", "resultGraph")
        .attr("class", "results__panel__graphs__pieGraph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(arrayDatos.map(function (d) {
        return d[0];
    }));

    svg.append("g")
        .attr("class", "y axis")
        .style("font-size", "11px")
        .attr("transform", "translate(0," + height + ")")
        .call(yAxis)
        .selectAll(".tick text")
        .call(wrap, margin.left);

    svg.selectAll("rect")
        .data(arrayDatos)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return x(d[0]);
        })
        .attr("y", function (d) {
            return y(d[1]);
        })
        .attr("width", function (d) {
            return x.rangeBand();
        })
        .attr("height", 0)
        .attr('stroke-width', 1)
        .style("fill", function (d, i) {
            return d[2];
        })
        .style("cursor", "pointer")
        .transition()
        .duration(1000)
        .delay(function (d, i) {
            return i * 50;
        })
        .attr("y", function (d, i) {
            return y(d[1]);
        })
        .attr("height", function (d, i) {
            return height - y(d[1]);
        });

    svg.selectAll(".totalTipo")
        .data(arrayDatos)
        .enter()
        .append("text")
        .attr("class", "totalTipo")
        .attr("x", function (d, i) {
            return x(d[0]) + x.rangeBand() / 2;
        })
        .attr("y", function (d) {
            return y(d[1]) - 10;
        })
        .attr("text-anchor", "middle")
        .style('font-size', '10px')
        .style('display', 'block')
        .text(function (d, i) {
            return d[1].toLocaleString('de-DE');
        });

    svg.append("g")
        .attr("transform", "translate(" + 0 + "," + (height + margin.top + margin.bottom / 2) + ")")
        .append("text")
        .attr("class", "legend__name")
        .attr("x", 0)
        .attr("y", 30)
        .attr("text-anchor", "start")
        .attr('font-size', '0.8em')
        .attr('font-weight', '500')
        .text("Total: " + totalData.toLocaleString("de-DE") + " " + getUnidades(varVariable)); //

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", -9).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", -9).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

}

function loadBarsV(data) { //Barras Horizontales
    var arrayDatos = [];
    var arrayNumber = [];
    var totalData = 0;
    var variablesArreglo = [];
    var variablesNombreArreglo = [];
    var variablesArreglo = [];
    var variablesFiltroArreglo = [];
    var variablesNombreArreglo = [];

    for (var a = 0; a < listaVariables.length; a++) {
        if (varSubtema == listaVariables[a][0].substring(0, 5)) {
            variablesArreglo.push(listaVariables[a][1]);
            variablesFiltroArreglo.push(listaFilterVariables[a][1]);
            variablesNombreArreglo.push(listaNombresVariables[a][1]);
        }
    }

    for (var j = 0; j < variablesArreglo.length; j++) {
        arrayDatos.push([variablesNombreArreglo[j], 0, ""]);
        arrayNumber.push(0);
    }

    var colores = []
    for (var a = 0; a < listaColores.length; a++) {
        var auxSubtema = listaColores[a][0].substring(0, 5)
        if (varSubtema == auxSubtema) {
            colores.push(chroma(listaColores[a][1].split(",")));
        }
    }

    // c(variablesArreglo)
    // c(variablesFiltroArreglo)
    // c(getClase())

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < variablesArreglo.length; j++) {
            //if (data[i]["ANIO"] == $("#tiempoAnual").val()) {
            if (getNivelesFiltro() == "0") {
                if ($("#FiltroGeograficoLvl2").val() == "-1" || $("#FiltroGeograficoLvl1").val() == "-1") {
                    if (getTieneClase() == "S") {
                        if (data[i]["CLASE"] == getClase()) {
                            arrayDatos[j][1] += parseFloat(getNumber(data[i][variablesFiltroArreglo[j]]))
                            arrayDatos[j][2] = colores[j]
                            arrayNumber[j] += parseFloat(getNumber(data[i][variablesFiltroArreglo[j]]))
                        }
                    }
                    else {
                        arrayDatos[j][1] += parseFloat(getNumber(data[i][variablesFiltroArreglo[j]]))
                        arrayDatos[j][2] = colores[j]
                        arrayNumber[j] += parseFloat(getNumber(data[i][variablesFiltroArreglo[j]]))
                    }
                }
                else {
                    if (getTieneClase() == "S") {
                        if (data[i]["CLASE"] == getClase()) {
                            if (data[i]["CODIGO_F2"].length == 3) {
                                if ((data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                    arrayDatos[j][1] += parseFloat(getNumber(data[i][variablesFiltroArreglo[j]]))
                                    arrayDatos[j][2] = colores[j]
                                    arrayNumber[j] += parseFloat(getNumber(data[i][variablesFiltroArreglo[j]]))
                                }
                            }
                            else {
                                if (data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                    arrayDatos[j][1] += parseFloat(getNumber(data[i][variablesFiltroArreglo[j]]))
                                    arrayDatos[j][2] = colores[j]
                                    arrayNumber[j] += parseFloat(getNumber(data[i][variablesFiltroArreglo[j]]))
                                }
                            }
                        }
                    }
                    else {
                        if (data[i]["CODIGO_F2"].length == 3) {
                            if ((data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i][variablesFiltroArreglo[j]]))
                                arrayDatos[j][2] = colores[j]
                                arrayNumber[j] += parseFloat(getNumber(data[i][variablesFiltroArreglo[j]]))
                            }
                        }
                        else {
                            if (data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i][variablesFiltroArreglo[j]]))
                                arrayDatos[j][2] = colores[j]
                                arrayNumber[j] += parseFloat(getNumber(data[i][variablesFiltroArreglo[j]]))
                            }
                        }
                    }
                }
            } else {
                if ($("#FiltroGeograficoLvl2").val() == "-1" || $("#FiltroGeograficoLvl1").val() == "-1") {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j]) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                arrayDatos[j][2] = colores[j]
                                arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j]) {
                                    arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                    arrayDatos[j][2] = colores[j]
                                    arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                }
                            }
                        }
                    }
                    else {
                        if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j]) {
                            arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                            arrayDatos[j][2] = colores[j]
                            arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                        }
                    }
                }
                else {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (data[i]["CLASE"] == getClase()) {
                                if (data[i]["CODIGO_F2"].length == 3) {
                                    if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                        arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                        arrayDatos[j][2] = colores[j]
                                        arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    }
                                }
                                else {
                                    if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                        arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                        arrayDatos[j][2] = colores[j]
                                        arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    }
                                }
                            }
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                if (data[i]["CODIGO_F2"].length == 3) {
                                    if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                        arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                        arrayDatos[j][2] = colores[j]
                                        arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    }
                                }
                                else {
                                    if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                        arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                        arrayDatos[j][2] = colores[j]
                                        arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    }
                                }
                            }
                        }

                    }
                    else {
                        if (data[i]["CODIGO_F2"].length == 3) {
                            if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                arrayDatos[j][2] = colores[j]
                                arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                        else {
                            if (data[i][variablesFiltroArreglo[j]] == variablesArreglo[j] && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                arrayDatos[j][2] = colores[j]
                                arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                    }
                }
            }
            //}
        }
    }

    arrayDatos.sort(function (a, b) {
        if (a[1] === b[1]) {
            return 0;
        }
        else {
            return (a[1] > b[1]) ? -1 : 1;
        }
    })

    for (var i = 0; i < arrayNumber.length; i++) {
        totalData += arrayNumber[i];
    }

    // c(arrayDatos)

    var height = 80 * arrayDatos.length;
    var margin = { top: 20, right: 30, bottom: 50, left: 120 };

    if ($(".results__panel__graphs").width() == 0) {
        var width = $(".Geovisor__content").width() * 0.2 - 20 - margin.left - margin.right;
    } else {
        var width = $(".results__panel__graphs").width() - margin.left - margin.right;
    }
    var max = d3.max(arrayNumber) + (d3.max(arrayNumber) * 0.1);
    var x = d3.scale.linear().domain([0, max]).range([0, width]);
    var y = d3.scale.ordinal().rangeRoundBands([0, height], 0.1);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(function (d, i) {
            return d;
        });

    d3.select("#resultGraph").remove();
    var svg = d3.select(".results__panel__graphs")
        .append("svg")
        .attr("id", "resultGraph")
        .attr("class", "results__panel__graphs__pieGraph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    y.domain(arrayDatos.map(function (d) {
        return d[0];
    }));

    svg.append("g")
        .attr("class", "y axis")
        .style("font-size", "0.8em")
        .call(yAxis)
        .selectAll(".tick text")
        .call(wrap, (margin.left - 10));

    svg.selectAll("rect")
        .data(arrayDatos)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return 0;
        })
        .attr("y", function (d) {
            return y(d[0]);
        })
        .attr("width", function (d) {
            return 0;
        })
        .attr("height", function (d) {
            return y.rangeBand();
        })
        .attr('stroke-width', 1)
        .style("fill", function (d, i) {
            return d[2];
        })
        .style("cursor", "pointer")
        .transition()
        .duration(1000)
        .delay(function (d, i) {
            return i * 50;
        })
        .attr("width", function (d, i) {
            return x(d[1]);
        });

    svg.selectAll(".totalTipo")
        .data(arrayDatos)
        .enter()
        .append("text")
        .attr("class", "totalTipo")
        .attr("x", function (d, i) {
            return x(d[1]) + 5;
        })
        .attr("y", function (d) {
            return y(d[0]) + y.rangeBand() / 2;
        })
        .attr("text-anchor", "start")
        .style('font-size', '11px')
        .style('display', 'block')
        .text(function (d, i) {
            return d[1].toLocaleString('de-DE');
        });

    svg.append("g")
        .attr("transform", "translate(" + 0 + "," + (height + margin.top + margin.bottom / 2) + ")")
        .append("text")
        .attr("class", "legend__name")
        .attr("x", -margin.left)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr('font-size', '0.8em')
        .attr('font-weight', '500')
        .text("Total: " + totalData.toLocaleString("de-DE") + " " + getUnidades(varVariable)); //

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", -9).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", -9).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }
}

function loadBarsFrecuencia(data) {
    var arrayDatos = [];
    var arrayNumber = [];
    for (var j = 0; j < nombresLeyenda.length; j++) {
        arrayDatos.push([nombresLeyenda[j], 0, ""]);
        arrayNumber.push(0);
    }
    tipoDiv = getTipoDiv();

    var color = getColorArray();

    if (colorClass != "") {
        color = colorClass;
    }

    var arrayFID = [];


    function getFID(array, value) {
        for (var m = 0; m < array.length; m++) {
            if (value == array[m]) return false;
        }
        return true;
    }

    for (var i = 0; i < data.features.length; i++) {
        if ($("#FiltroGeograficoLvl1").val() == "-1") {
            if (getFID(arrayFID, data.features[i].properties.DPTO_CCDGO)) {
                if (resultadoCortes.length == 1) {
                    arrayDatos[0][1] += 1;
                    arrayDatos[0][2] = color[4];
                    arrayNumber[0] += 1;
                }
                else if (resultadoCortes.length == 2) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[0] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[1]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[4];
                        arrayNumber[0] += 1;
                    }
                }
                else if (resultadoCortes.length == 3) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[2]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[4];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[0] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[5];
                        arrayNumber[1] += 1;
                    }
                }
                else if (resultadoCortes.length == 4) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[3]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[2];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[4];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[6];
                        arrayNumber[2] += 1;
                    }
                }
                else if (resultadoCortes.length == 5) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[3] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[4]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[2];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[3]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[4];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[6];
                        arrayNumber[2] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[3][1] += 1;
                        arrayDatos[3][2] = color[8];
                        arrayNumber[3] += 1;
                    }
                }
                else if (resultadoCortes.length == 6) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[4] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[5]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[0];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[3] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[4]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[2];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[3]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[4];
                        arrayNumber[2] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[3][1] += 1;
                        arrayDatos[3][2] = color[6];
                        arrayNumber[3] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[4][1] += 1;
                        arrayDatos[4][2] = color[8];
                        arrayNumber[4] += 1;
                    }
                }
                else if (resultadoCortes.length == 7) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[5] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[6]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[0];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[4] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[5]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[2];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[3] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[4]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[4];
                        arrayNumber[2] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[3]) {
                        arrayDatos[3][1] += 1;
                        arrayDatos[3][2] = color[5];
                        arrayNumber[3] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[4][1] += 1;
                        arrayDatos[4][2] = color[6];
                        arrayNumber[4] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[5][1] += 1;
                        arrayDatos[5][2] = color[8];
                        arrayNumber[5] += 1;
                    }
                }
                else if (resultadoCortes.length == 8) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[6] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[7]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[0];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[5] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[6]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[2];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[4] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[5]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[3];
                        arrayNumber[2] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[3] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[4]) {
                        arrayDatos[3][1] += 1;
                        arrayDatos[3][2] = color[4];
                        arrayNumber[3] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[3]) {
                        arrayDatos[4][1] += 1;
                        arrayDatos[4][2] = color[5];
                        arrayNumber[4] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[5][1] += 1;
                        arrayDatos[5][2] = color[6];
                        arrayNumber[5] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[6][1] += 1;
                        arrayDatos[6][2] = color[8];
                        arrayNumber[6] += 1;
                    }
                }
                else if (resultadoCortes.length == 9) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[7] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[8]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[0];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[6] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[7]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[1];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[5] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[6]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[2];
                        arrayNumber[2] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[4] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[5]) {
                        arrayDatos[3][1] += 1;
                        arrayDatos[3][2] = color[3];
                        arrayNumber[3] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[3] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[4]) {
                        arrayDatos[4][1] += 1;
                        arrayDatos[4][2] = color[4];
                        arrayNumber[4] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[3]) {
                        arrayDatos[5][1] += 1;
                        arrayDatos[5][2] = color[5];
                        arrayNumber[5] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[6][1] += 1;
                        arrayDatos[6][2] = color[6];
                        arrayNumber[6] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[7][1] += 1;
                        arrayDatos[7][2] = color[8];
                        arrayNumber[7] += 1;
                    }
                }
                else if (resultadoCortes.length == 10) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[8] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[9]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[0];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[7] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[8]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[1];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[6] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[7]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[2];
                        arrayNumber[2] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[5] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[6]) {
                        arrayDatos[3][1] += 1;
                        arrayDatos[3][2] = color[3];
                        arrayNumber[3] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[4] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[5]) {
                        arrayDatos[4][1] += 1;
                        arrayDatos[4][2] = color[4];
                        arrayNumber[4] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[3] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[4]) {
                        arrayDatos[5][1] += 1;
                        arrayDatos[5][2] = color[5];
                        arrayNumber[5] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[3]) {
                        arrayDatos[6][1] += 1;
                        arrayDatos[6][2] = color[6];
                        arrayNumber[6] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[7][1] += 1;
                        arrayDatos[7][2] = color[7];
                        arrayNumber[7] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[8][1] += 1;
                        arrayDatos[8][2] = color[8];
                        arrayNumber[8] += 1;
                    }
                }
                arrayFID.push(data.features[i].properties.DPTO_CCDGO)
            }
        }
        else { //
            if (getFID(arrayFID, data.features[i].properties.MPIO_CCNCT)) {
                if (resultadoCortes.length == 1) {
                    arrayDatos[0][1] += 1;
                    arrayDatos[0][2] = color[4];
                    arrayNumber[0] += 1;
                }
                else if (resultadoCortes.length == 2) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[0] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[1]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[4];
                        arrayNumber[0] += 1;
                    }
                }
                else if (resultadoCortes.length == 3) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[2]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[4];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[0] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[5];
                        arrayNumber[1] += 1;
                    }
                }
                else if (resultadoCortes.length == 4) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[3]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[2];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[4];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[6];
                        arrayNumber[2] += 1;
                    }
                }
                else if (resultadoCortes.length == 5) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[3] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[4]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[2];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[3]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[4];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[6];
                        arrayNumber[2] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[3][1] += 1;
                        arrayDatos[3][2] = color[8];
                        arrayNumber[3] += 1;
                    }
                }
                else if (resultadoCortes.length == 6) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[4] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[5]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[0];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[3] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[4]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[2];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[3]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[4];
                        arrayNumber[2] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[3][1] += 1;
                        arrayDatos[3][2] = color[6];
                        arrayNumber[3] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[4][1] += 1;
                        arrayDatos[4][2] = color[8];
                        arrayNumber[4] += 1;
                    }
                }
                else if (resultadoCortes.length == 7) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[5] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[6]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[0];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[4] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[5]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[2];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[3] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[4]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[4];
                        arrayNumber[2] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[3]) {
                        arrayDatos[3][1] += 1;
                        arrayDatos[3][2] = color[5];
                        arrayNumber[3] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[4][1] += 1;
                        arrayDatos[4][2] = color[6];
                        arrayNumber[4] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[5][1] += 1;
                        arrayDatos[5][2] = color[8];
                        arrayNumber[5] += 1;
                    }
                }
                else if (resultadoCortes.length == 8) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[6] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[7]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[0];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[5] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[6]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[2];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[4] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[5]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[3];
                        arrayNumber[2] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[3] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[4]) {
                        arrayDatos[3][1] += 1;
                        arrayDatos[3][2] = color[4];
                        arrayNumber[3] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[3]) {
                        arrayDatos[4][1] += 1;
                        arrayDatos[4][2] = color[5];
                        arrayNumber[4] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[5][1] += 1;
                        arrayDatos[5][2] = color[6];
                        arrayNumber[5] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[6][1] += 1;
                        arrayDatos[6][2] = color[8];
                        arrayNumber[6] += 1;
                    }
                }
                else if (resultadoCortes.length == 9) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[7] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[8]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[0];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[6] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[7]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[1];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[5] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[6]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[2];
                        arrayNumber[2] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[4] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[5]) {
                        arrayDatos[3][1] += 1;
                        arrayDatos[3][2] = color[3];
                        arrayNumber[3] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[3] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[4]) {
                        arrayDatos[4][1] += 1;
                        arrayDatos[4][2] = color[4];
                        arrayNumber[4] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[3]) {
                        arrayDatos[5][1] += 1;
                        arrayDatos[5][2] = color[5];
                        arrayNumber[5] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[6][1] += 1;
                        arrayDatos[6][2] = color[6];
                        arrayNumber[6] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[7][1] += 1;
                        arrayDatos[7][2] = color[8];
                        arrayNumber[7] += 1;
                    }
                }
                else if (resultadoCortes.length == 10) {
                    if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[8] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[9]) {
                        arrayDatos[0][1] += 1;
                        arrayDatos[0][2] = color[0];
                        arrayNumber[0] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[7] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[8]) {
                        arrayDatos[1][1] += 1;
                        arrayDatos[1][2] = color[1];
                        arrayNumber[1] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[6] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[7]) {
                        arrayDatos[2][1] += 1;
                        arrayDatos[2][2] = color[2];
                        arrayNumber[2] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[5] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[6]) {
                        arrayDatos[3][1] += 1;
                        arrayDatos[3][2] = color[3];
                        arrayNumber[3] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[4] && data.features[i]["properties"]["VARIABLE"] <= resultadoCortes[5]) {
                        arrayDatos[4][1] += 1;
                        arrayDatos[4][2] = color[4];
                        arrayNumber[4] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[3] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[4]) {
                        arrayDatos[5][1] += 1;
                        arrayDatos[5][2] = color[5];
                        arrayNumber[5] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[2] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[3]) {
                        arrayDatos[6][1] += 1;
                        arrayDatos[6][2] = color[6];
                        arrayNumber[6] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] >= resultadoCortes[1] && data.features[i]["properties"]["VARIABLE"] < resultadoCortes[2]) {
                        arrayDatos[7][1] += 1;
                        arrayDatos[7][2] = color[7];
                        arrayNumber[7] += 1;
                    }
                    else if (data.features[i]["properties"]["VARIABLE"] < resultadoCortes[1]) {
                        arrayDatos[8][1] += 1;
                        arrayDatos[8][2] = color[8];
                        arrayNumber[8] += 1;
                    }
                }

                arrayFID.push(data.features[i].properties.MPIO_CCNCT)
            }
        }
    }

    //c(arrayDatos)

    arrayDatos.sort(function (a, b) {
        if (a[1] === b[1]) {
            return 0;
        }
        else {
            return (a[1] > b[1]) ? -1 : 1;
        }
    })

    var height = 25 * arrayDatos.length;
    var margin = { top: 20, right: 50, bottom: 20, left: 100 };
    if ($(".results__panel__frequency").width() == 0) {
        var width = $(".Geovisor__content").width() * 0.2 - 20 - margin.left - margin.right;
    } else {
        var width = $(".results__panel__frequency").width() - margin.left - margin.right;
    }
    var max = d3.max(arrayNumber) + (d3.max(arrayNumber) * 0.1);
    var x = d3.scale.linear().domain([0, max]).range([0, width]);
    var y = d3.scale.ordinal().rangeRoundBands([0, height], 0.1);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(function (d, i) {
            return d;
        });

    d3.select("#frequencyGraph").remove();
    var svg = d3.select(".results__panel__frequency")
        .append("svg")
        .attr("id", "frequencyGraph")
        .attr("class", "results__panel__frequency__barGraph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    y.domain(arrayDatos.map(function (d) {
        return d[0];
    }));

    svg.append("g")
        .attr("class", "y axis")
        .style("font-size", "0.9em")
        .call(yAxis)
        .selectAll(".tick text")
        .call(wrap, (margin.left - 10));

    svg.selectAll("rect")
        .data(arrayDatos)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return 0;
        })
        .attr("y", function (d) {
            return y(d[0]);
        })
        .attr("width", function (d) {
            return 0;
        })
        .attr("height", function (d) {
            return y.rangeBand();
        })
        .attr('stroke-width', 1)
        .style("fill", function (d, i) {
            return d[2];
        })
        .style("cursor", "pointer")
        .transition()
        .duration(1000)
        .delay(function (d, i) {
            return i * 50;
        })
        .attr("width", function (d, i) {
            return x(d[1]);
        });

    svg.selectAll(".totalTipo")
        .data(arrayDatos)
        .enter()
        .append("text")
        .attr("class", "totalTipo")
        .attr("x", function (d, i) {
            return x(d[1]) + 5;
        })
        .attr("y", function (d) {
            return y(d[0]) + y.rangeBand() / 2;
        })
        .attr("text-anchor", "start")
        .style('font-size', '11px')
        .style('display', 'block')
        .text(function (d, i) {
            return d[1].toLocaleString('de-DE');
        });

    var heightPrint = 20 * arrayDatos.length;
    var margin = { top: 20, right: 50, bottom: 20, left: 100 };
    if ($(".Modal__panel__frequency").width() == 0) {
        var widthPrint = $(".PrintModal").width() * 0.58 - 20 - margin.left - margin.right;
    } else {
        var widthPrint = $(".Modal__panel__frequency").width() - margin.left - margin.right;
    }
    var xPrint = d3.scale.linear().domain([0, max]).range([0, widthPrint]);
    var yPrint = d3.scale.ordinal().rangeRoundBands([0, heightPrint], 0.1);

    var yAxisPrint = d3.svg.axis()
        .scale(yPrint)
        .orient("left")
        .tickFormat(function (d, i) {
            return d;
        });

    d3.select("#frequencyGraphPrint").remove();
    var svg = d3.select(".Modal__panel__frequency")
        .append("svg")
        .attr("id", "frequencyGraphPrint")
        .attr("class", "Modal__panel__frequency__barGraph")
        .attr("width", widthPrint + margin.left + margin.right)
        .attr("height", heightPrint + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    yPrint.domain(arrayDatos.map(function (d) {
        return d[0];
    }));

    svg.append("g")
        .attr("class", "y axis")
        .style("font-size", "0.8rem")
        .call(yAxis)
        .selectAll(".tick text")
        .call(wrap, (margin.left - 10));

    svg.selectAll("rect")
        .data(arrayDatos)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return 0;
        })
        .attr("y", function (d) {
            return yPrint(d[0]);
        })
        .attr("width", function (d) {
            return xPrint(d[1]);
        })
        .attr("height", function (d) {
            return yPrint.rangeBand();
        })
        .attr('stroke-width', 1)
        .style("fill", function (d, i) {
            return d[2];
        })

    svg.selectAll(".totalTipo")
        .data(arrayDatos)
        .enter()
        .append("text")
        .attr("class", "totalTipo")
        .attr("x", function (d, i) {
            return xPrint(d[1]) + 5;
        })
        .attr("y", function (d) {
            return yPrint(d[0]) + yPrint.rangeBand() / 2 + 2;
        })
        .attr("text-anchor", "start")
        .style('display', 'block')
        .text(function (d, i) {
            return d[1].toLocaleString('de-DE');
        });

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", -9).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", -9).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }
}

function loadHistorico(data) { //Barras Verticales
    var arrayDatos = [];
    var arrayNumber = [];
    var totalData = 0;
    var variablesAnios = [];
    var variableSeleccionArreglo;
    var variableSeleccionNombreArreglo;
    var variableSeleccionFiltroArreglo;

    for (var a = 0; a < listaVariables.length; a++) {
        if ($var.Map.varVariable == listaVariables[a][0]) {
            variableSeleccionArreglo = listaVariables[a][1];
            variableSeleccionNombreArreglo = listaFilterVariables[a][1];
            variableSeleccionFiltroArreglo = listaNombresVariables[a][1];
        }
    }

    for (var i = 0; i < data.length; i++) {
        variablesAnios.push(data[i]["ANIO"]);
    }
    variablesAnios = variablesAnios.unique();

    for (var j = 0; j < variablesAnios.length; j++) {
        arrayDatos.push([variablesAnios[j], 0, ""]);
        arrayNumber.push(0);
    }

    var colores;
    for (var a = 0; a < listaColores.length; a++) {
        if ($var.Map.varVariable == listaColores[a][0]) {
            colores = chroma(listaColores[a][1].split(","));
        }
    }

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < variablesAnios.length; j++) {
            //if (data[i]["ANIO"] == variablesAnios[j]) {
            if (getNivelesFiltro() == "0") {
                if ($("#FiltroGeograficoLvl2").val() == "-1" || $("#FiltroGeograficoLvl1").val() == "-1") {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            arrayDatos[j][1] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                            arrayDatos[j][2] = colores
                            arrayNumber[j] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                                arrayDatos[j][2] = colores
                                arrayNumber[j] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                            }
                        }
                    }
                    else {
                        arrayDatos[j][1] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                        arrayDatos[j][2] = colores
                        arrayNumber[j] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                    }
                }
                else {
                    if (getTieneClase() == "S") {
                        if (data[i]["CLASE"] == getClase()) {
                            if (data[i]["CODIGO_F2"].length == 3) {
                                if ((data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                    arrayDatos[j][1] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                                    arrayDatos[j][2] = colores
                                    arrayNumber[j] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                                }
                            }
                            else {
                                if (data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                    arrayDatos[j][1] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                                    arrayDatos[j][2] = colores
                                    arrayNumber[j] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                                }
                            }
                        }
                    }
                    else {
                        if (data[i]["CODIGO_F2"].length == 3) {
                            if ((data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                                arrayDatos[j][2] = colores
                                arrayNumber[j] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                            }
                        }
                        else {
                            if (data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                                arrayDatos[j][2] = colores
                                arrayNumber[j] += parseFloat(getNumber(data[i][variableSeleccionArreglo]))
                            }
                        }
                    }
                }
            } else {
                if ($("#FiltroGeograficoLvl2").val() == "-1" || $("#FiltroGeograficoLvl1").val() == "-1") {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (data[i][variableSeleccionNombreArreglo] == variableSeleccionArreglo) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                arrayDatos[j][2] = colores
                                arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                if (data[i][variableSeleccionNombreArreglo] == variableSeleccionArreglo) {
                                    arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                    arrayDatos[j][2] = colores
                                    arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                }
                            }
                        }

                    }
                    else {
                        if (data[i][variableSeleccionNombreArreglo] == variableSeleccionArreglo) {
                            arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                            arrayDatos[j][2] = colores
                            arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                        }
                    }
                }
                else {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (data[i]["CODIGO_F2"].length == 3) {
                                if (data[i][variableSeleccionNombreArreglo] == variableSeleccionArreglo && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                    arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                    arrayDatos[j][2] = colores
                                    arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                }
                            }
                            else {
                                if (data[i][variableSeleccionNombreArreglo] == variableSeleccionArreglo && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                    arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                    arrayDatos[j][2] = colores
                                    arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                }
                            }
                        }
                        else {
                            if (data[i]["CLASE"] == getClase()) {
                                if (data[i]["CODIGO_F2"].length == 3) {
                                    if (data[i][variableSeleccionNombreArreglo] == variableSeleccionArreglo && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                        arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                        arrayDatos[j][2] = colores
                                        arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    }
                                }
                                else {
                                    if (data[i][variableSeleccionNombreArreglo] == variableSeleccionArreglo && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                        arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                        arrayDatos[j][2] = colores
                                        arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (data[i]["CODIGO_F2"].length == 3) {
                            if (data[i][variableSeleccionNombreArreglo] == variableSeleccionArreglo && (data[i]["CODIGO_F1"] + data[i]["CODIGO_F2"]) == $("#FiltroGeograficoLvl2").val()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                arrayDatos[j][2] = colores
                                arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                        else {
                            if (data[i][variableSeleccionNombreArreglo] == variableSeleccionArreglo && data[i]["CODIGO_F2"] == $("#FiltroGeograficoLvl2").val()) {
                                arrayDatos[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                arrayDatos[j][2] = colores
                                arrayNumber[j] += parseFloat(getNumber(data[i]["VALOR"]))
                            }
                        }
                    }
                }
            }
            //}
        }
    }

    arrayDatos.sort(function (a, b) {
        if (a[0] === b[0]) {
            return 0;
        }
        else {
            return (a[0] < b[0]) ? -1 : 1;
        }
    })

    for (var i = 0; i < arrayNumber.length; i++) {
        totalData += arrayNumber[i];
    }

    var height = 250;
    var margin = { top: 100, right: 10, bottom: 30, left: 30 };
    if ($(".results__panel__historico").width() == 0) {
        var width = $(".Geovisor__content").width() * 0.2 - 20 - margin.left - margin.right;
    } else {
        var width = $(".results__panel__historico").width() - margin.left - margin.right;
    }
    var max = d3.max(arrayNumber) + (d3.max(arrayNumber) * 0.1);
    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.3);
    var y = d3.scale.linear().domain([0, max]).range([height, 0]);

    var yAxis = d3.svg.axis()
        .orient("bottom")
        .scale(x)
        .tickFormat(function (d, i) {
            return d;
        });

    d3.select("#resultGraphHistorico").remove();
    var svg = d3.select(".results__panel__historico")
        .append("svg")
        .attr("id", "resultGraphHistorico")
        .attr("class", "results__panel__historico__Graph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(arrayDatos.map(function (d) {
        return d[0];
    }));

    svg.append("g")
        .attr("class", "y axis")
        .style("font-size", "8px")
        .attr("transform", "translate(0," + height + ")")
        .call(yAxis)
        .selectAll(".tick text")
        .style('transform', 'rotate(-30deg)')
    // .call(wrap, margin.left);

    svg.selectAll("rect")
        .data(arrayDatos)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return x(d[0]);
        })
        .attr("y", function (d) {
            return y(d[1]);
        })
        .attr("width", function (d) {
            return x.rangeBand();
        })
        .attr("height", 0)
        .attr('stroke-width', 1)
        .style("fill", function (d, i) {
            return d[2];
        })
        .style("cursor", "pointer")
        .transition()
        .duration(1000)
        .delay(function (d, i) {
            return i * 50;
        })
        .attr("y", function (d, i) {
            return y(d[1]);
        })
        .attr("height", function (d, i) {
            return height - y(d[1]);
        });

    svg.selectAll(".totalTipo")
        .data(arrayDatos)
        .enter()
        .append("text")
        .attr("class", "totalTipo")
        .attr("x", function (d, i) {
            return -y(d[1]) + 10; //y(d[1])
        })
        .attr("y", function (d) {
            return x(d[0]) + x.rangeBand() / 2
        })
        .attr("text-anchor", "start")
        .style('font-size', '10px')
        .style('transform', 'rotate(-90deg)')
        .style('display', 'block')
        .text(function (d, i) {
            return d[1].toLocaleString('de-DE');
        });

    //TO PRINT
    var heightPrint = 400;
    if ($(".Modal__panel__historico").width() == 0) {
        var widthPrint = $(".PrintModal").width() * 0.58 - margin.left - margin.right;
    } else {
        var widthPrint = $(".Modal__panel__historico").width() - margin.left - margin.right;
    }
    var xPrint = d3.scale.ordinal().rangeRoundBands([0, widthPrint], 0.3);
    var yPrint = d3.scale.linear().domain([0, max]).range([heightPrint, 0]);

    var yAxisPrint = d3.svg.axis()
        .orient("bottom")
        .scale(xPrint)
        .tickFormat(function (d, i) {
            return d;
        });


    d3.select("#resultGraphHistoricoPrint").remove();
    var svg = d3.select(".Modal__panel__historico")
        .append("svg")
        .attr("id", "resultGraphHistoricoPrint")
        .attr("class", "Modal__panel__historico__Graph")
        .attr("width", widthPrint + margin.left + margin.right)
        .attr("height", heightPrint + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xPrint.domain(arrayDatos.map(function (d) {
        return d[0];
    }));

    svg.append("g")
        .attr("class", "y axis")
        .style("font-size", "12px")
        .attr("transform", "translate(0," + heightPrint + ")")
        .call(yAxisPrint)
        .selectAll(".tick text")
        .style('transform', 'rotate(-30deg)')

    svg.selectAll("path")
        .attr('stroke-width', '1px')
        .attr('stroke', '#B5B5B5')
        .attr('fill', 'none')

    // .call(wrap, margin.left);

    svg.selectAll("rect")
        .data(arrayDatos)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return xPrint(d[0]);
        })
        .attr("y", function (d) {
            return yPrint(d[1]);
        })
        .attr("width", function (d) {
            return xPrint.rangeBand();
        })
        .attr("height", 0)
        .attr('stroke-width', 1)
        .style("fill", function (d, i) {
            return d[2];
        })
        .style("cursor", "pointer")
        .transition()
        .duration(1000)
        .delay(function (d, i) {
            return i * 50;
        })
        .attr("y", function (d, i) {
            return yPrint(d[1]);
        })
        .attr("height", function (d, i) {
            return heightPrint - yPrint(d[1]);
        });

    svg.selectAll(".totalTipo")
        .data(arrayDatos)
        .enter()
        .append("text")
        .attr("class", "totalTipo")
        .attr("x", function (d, i) {
            return -yPrint(d[1]) + 10; //y(d[1])
        })
        .attr("y", function (d) {
            return xPrint(d[0]) + xPrint.rangeBand() / 2
        })
        .attr("text-anchor", "start")
        .style('font-size', '12px')
        .style('transform', 'rotate(-90deg)')
        .style('display', 'block')
        .text(function (d, i) {
            return d[1].toLocaleString('de-DE');
        });

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", -9).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", -9).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

}

function loadPiramide(data) {
    var variablesArreglo = [];
    var propiedad = "SEXO";
    var totalHombres = 0;
    var totalMujeres = 0;

    for (var a = 0; a < listaVariables.length; a++) {
        if (varSubtema == listaVariables[a][0].substring(0, 5)) {
            variablesArreglo.push([listaVariables[a][1], listaFilterVariables[a][1], listaNombresVariables[a][1]]);
        }
    }

    variablesArreglo = variablesArreglo.sort(function (a, b) {
        if (parseInt(a[0]) === parseInt(b[0])) {
            return 0;
        }
        else {
            return (parseInt(a[0]) < parseInt(b[0])) ? 1 : -1;
        }
    })

    for (var i = 0; i < data.length; i++) {
        if (getTieneClase() == "S") {
            if (data[i]["CLASE"] == getClase()) {
                if (data[i][propiedad] == "1") {
                    totalHombres += parseFloat(getNumber(data[i]["VALOR"]));
                }
                if (data[i][propiedad] == "2") {
                    totalMujeres += parseFloat(getNumber(data[i]["VALOR"]));
                }
            }
        }
        else {
            if (data[i][propiedad] == "1") {
                totalHombres += parseFloat(getNumber(data[i]["VALOR"]));
            }
            if (data[i][propiedad] == "2") {
                totalMujeres += parseFloat(getNumber(data[i]["VALOR"]));
            }
        }
    }

    // c(totalHombres, totalMujeres)  
    var dat = [];
    for (var i = 0; i < variablesArreglo.length; i++) {
        dat.push([variablesArreglo[i][2], 0, 0, 0, 0]) //1 hombres 2 mujeres 3 Porcentaje Hombres 4 Porcentaje Mujeres
    }
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < variablesArreglo.length; j++) {
            if (data[i][variablesArreglo[j][1]] == variablesArreglo[j][0]) {
                if (getTieneClase() == "S") {
                    if (filtroArea == 0) {
                        if (data[i][propiedad] == "1") {
                            dat[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                            dat[j][3] += parseFloat(getNumber(data[i]["VALOR"])) * 100 / totalHombres;
                        }
                        if (data[i][propiedad] == "2") {
                            dat[j][2] += parseFloat(getNumber(data[i]["VALOR"]))
                            dat[j][4] += parseFloat(getNumber(data[i]["VALOR"])) * 100 / totalMujeres;
                        }
                    }
                    else {
                        if (data[i]["CLASE"] == getClase()) {
                            if (data[i][propiedad] == "1") {
                                dat[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                                dat[j][3] += parseFloat(getNumber(data[i]["VALOR"])) * 100 / totalHombres;
                            }
                            if (data[i][propiedad] == "2") {
                                dat[j][2] += parseFloat(getNumber(data[i]["VALOR"]))
                                dat[j][4] += parseFloat(getNumber(data[i]["VALOR"])) * 100 / totalMujeres;
                            }
                        }
                    }
                } else {
                    if (data[i][propiedad] == "1") {
                        dat[j][1] += parseFloat(getNumber(data[i]["VALOR"]))
                        dat[j][3] += parseFloat(getNumber(data[i]["VALOR"])) * 100 / totalHombres;
                    }
                    if (data[i][propiedad] == "2") {
                        dat[j][2] += parseFloat(getNumber(data[i]["VALOR"]))
                        dat[j][4] += parseFloat(getNumber(data[i]["VALOR"])) * 100 / totalMujeres;
                    }
                }
            }
        }
    }

    // dat = dat.reverse();  

    var maxValue = d3.max(dat, function (d) {
        if (d[3] > d[4])
            return Number(d[3])
        else
            return Number(d[4]);
    });

    var maxLength = d3.max(dat, function (d) {
        return d[0].length;
    });

    // c(maxLength)
    // c(maxValue)

    var heightPiramide = 410 - 60;
    var margin = { top: 20, right: 10, bottom: 40, left: 10, middle: (10 + maxLength * 2) };
    if ($(".results__panel__graphs").width() == 0) {
        var widthPiramide = $(".Geovisor__content").width() * 0.2 - 20 - margin.left - margin.right;
    } else {
        var widthPiramide = $(".results__panel__graphs").width() - margin.left - margin.right;
    }
    var regionWidth = (widthPiramide / 2 - margin.middle);
    var pointA = regionWidth,
        pointB = widthPiramide - regionWidth;

    // CREATE SVG	
    d3.select("#resultGraph").remove();
    var svg = d3.select(".results__panel__graphs")
        .append("svg")
        .attr("id", "resultGraph")
        .attr("class", "results__panel__graphs__pieGraph")
        .attr('width', margin.left + widthPiramide + margin.right)
        .attr('height', margin.top + heightPiramide + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // MAKE GROUPS FOR EACH SIDE OF CHART
    var leftBarGroup = svg.append('g')
        .attr('transform', translation(pointA, 0) + 'scale(-1,1)');
    var rightBarGroup = svg.append('g')
        .attr('transform', translation(pointB, 0));

    svg.select(".edades").remove();
    var edades = svg.append("g")
        .attr("class", "edades")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", 20)
        .attr("width", 100)
        .append("text")
        .attr("x", widthPiramide / 2)
        .attr("y", "0")
        .attr("text-anchor", "middle")
        .style("font-size", "9px")
        .text("Pirámide de población");

    // SET UP SCALES
    var xScale = d3.scale.linear()
        .domain([0, maxValue])
        .range([0, regionWidth])
        .nice();
    var xScaleLeft = d3.scale.linear()
        .domain([0, maxValue])
        .range([regionWidth, 0]);

    var xScaleRight = d3.scale.linear()
        .domain([0, maxValue])
        .range([0, regionWidth]);

    var yScale = d3.scale.ordinal()
        .domain(dat.sort(function (a, b) {
            var a1 = Number(a[0].split(" A ")[0]);
            var b1 = Number(b[0].split(" A ")[0]);
            if (!isNaN(a1) && !isNaN(b1)) {
                if (a1 < b1)
                    return -1;
                else if (a1 > b1)
                    return 1;
                else
                    return 0;
            }
            else {
                return -1;
            }
        }).map(function (d) {
            return d[0];
        }))
        .rangeRoundBands([heightPiramide, 10], 0.1);

    // SET UP AXES
    var yAxisLeft = d3.svg.axis()
        .scale(yScale)
        .orient('right')
        .tickSize(4, 0)
        .tickPadding(margin.middle - 4);

    var yAxisRight = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickSize(4, 0)
        .tickFormat('');

    var xAxisRight = d3.svg.axis()
        .tickSize(4, 0)
        .scale(xScale)
        .ticks(4)
        .tickFormat(function (d) {
            return d + "  %";
        })
        .orient('bottom');

    var xAxisLeft = d3.svg.axis()
        .tickSize(4, 0)
        .scale(xScale.copy().range([pointA, 0]))
        .ticks(4)
        .tickFormat(function (d) {
            return d + "  %";
        })
        .orient('bottom');

    // DRAW AXES
    svg.select(".axisPir.y.left").remove();
    svg.append('g')
        .attr('class', 'axisPir y left')
        .attr('transform', translation(pointA, 0))
        .call(yAxisLeft)
        .selectAll('text')
        .style('text-anchor', 'middle')
        .attr('font-size', '9px');

    svg.select(".axisPir.y.right").remove();
    svg.append('g')
        .attr('class', 'axisPir y right')
        .attr('font-size', '9px')
        .attr('transform', translation(pointB, 0))
        .call(yAxisRight);

    svg.select(".axisPir.x.left").remove();
    svg.append('g')
        .attr('class', 'axisPir x left')
        .attr('font-size', '9px')
        .attr('transform', translation(0, heightPiramide))
        .call(xAxisLeft);

    svg.select(".axisPir.x.right").remove();
    svg.append('g')
        .attr('class', 'axisPir x right')
        .attr('font-size', '9px')
        .attr('transform', translation(pointB, heightPiramide))
        .call(xAxisRight);


    // BARRA HOMBRES
    var lbg = leftBarGroup
        .selectAll('.barPir.left')
        .data(dat);

    lbg.enter()
        .append('rect')
        .attr('class', 'barPir left')
        .attr('x', 0)
        .attr('y', function (d) {
            return yScale((d[0]));
        })
        .attr('width', function (d) {
            return 0;
        })
        .attr('fill', '#70AECC')
        .attr('height', function (d) {
            return yScale.rangeBand();
        })
        .transition()
        .duration(1000)
        .delay(function (d, i) {
            return i * 50;
        })
        .attr("width", function (d, i) {
            return xScale(d[3]);
        });

    lbg.on("mouseover", function (d) {
        d3.select(".tooltip").remove();
        div = d3.select("body")
            .append("div")
            .attr("class", "tooltip");
    })
        .on("mouseout", function () {
            div.remove();
        })
        .on("mousemove", function (d) {
            return mousemove1(1, d);
        });

    // BARRA MUJERES
    var rbg = rightBarGroup
        .selectAll('.barPir.right')
        .data(dat);

    rbg.enter()
        .append('rect')
        .attr('class', 'barPir right')
        .attr('x', 0)
        .attr('y', function (d) {
            return yScale((d[0]))
        })
        .attr('width', function (d) {
            return 0;
        })
        .attr('fill', '#E83665')
        .attr('height', yScale.rangeBand())
        .transition()
        .duration(1000)
        .delay(function (d, i) {
            return i * 50;
        })
        .attr("width", function (d, i) {
            return xScale(d[4]);
        });

    rbg.on("mouseover", function (d) {
        d3.select(".tooltip").remove();
        div = d3.select("body")
            .append("div")
            .attr("class", "tooltip");
    })
        .on("mouseout", function () {
            div.remove();
        })
        .on("mousemove", function (d) {
            return mousemove1(2, d);
        });

    function mousemove1(i, d) {
        var sexo = "";
        var total = "";
        var porcentaje = "";
        if (i == "1") {
            sexo = "Hombres";
            total = d[1]
            porcentaje = d[3]
        }
        else {
            sexo = "Mujeres"
            total = d[2]
            porcentaje = d[4]
        }
        div.selectAll("text").remove()
        div.append("text")
            .html("Sexo: " + sexo
                + "<br>Grupo: " + (d[0])
                + "<br>Total: " + total.toLocaleString('de-DE')
                + "<br>Porcentaje: " + parseFloat(porcentaje.toFixed(1)).toLocaleString("de-DE") + "%");
        div.style("left", (d3.event.pageX - 100) + "px")
            .style("top", (d3.event.pageY - 120) + "px");
    }

    resultadoPiramide = totalHombres + totalMujeres;

    svg.select(".totalPiramide").remove();
    var total = svg.append("g")
        .attr("class", "totalPiramide")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", 30)
        .attr("width", 100)
        .append("text")
        .attr("x", widthPiramide / 2)//100, Posición del total de población
        .attr("y", heightPiramide + 30)
        .style("color", "#555")
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .text("Total población: " + resultadoPiramide.toLocaleString('de-DE'));
}

function loadTabla(data, inner) {
    var arrayData = [];
    var variablesArreglo = [];
    var variablesFiltroArreglo = [];
    var variablesNombreArreglo = [];

    for (var a = 0; a < listaVariables.length; a++) {
        if (varSubtema == listaVariables[a][0].substring(0, 5)) {
            variablesArreglo.push(listaVariables[a][1]);
            variablesFiltroArreglo.push(listaFilterVariables[a][1]);
            variablesNombreArreglo.push(listaNombresVariables[a][1]);
        }
    }

    function getNameArreglo(value) {
        for (var a = 0; a < variablesArreglo.length; a++) {
            if (value == variablesArreglo[a]) {
                return variablesNombreArreglo[a]
            }
        }
    }

    // c(variablesArreglo)
    // c(variablesFiltroArreglo)
    // c(variablesNombreArreglo)

    // Esctructura HTML del encabezado tabla de datos.
    table = "<thead class='Geovisor__tableBox__thead'>";
    table += "<th data-dynatable-column='cod_departamento'>" + "Código Departamento" + "</th>";
    table += "<th data-dynatable-column='departamento'>" + "Departamento" + "</th>";
    if ($("#FiltroGeograficoLvl1").val() != "-1") {
        table += "<th data-dynatable-column='cod_municipio'>" + "Código Municipio" + "</th>";
        table += "<th data-dynatable-column='municipio'>" + "Municipio" + "</th>";
    }

    if (getTieneAnio() == "S") { //ANIOS
        table += "<th data-dynatable-column='anio'>" + "Año" + "</th>";
    }
    if (getNivelesFiltro() == "0") {
        for (var h = 0; h < variablesArreglo.length; h++) {
            table += "<th data-dynatable-column='" + RemoveAccents(variablesArreglo[h]).replace(/ /g, '').toLowerCase() + "'>" + variablesNombreArreglo[h] + "</th>";
        }
    }
    else {
        table += "<th data-dynatable-column='" + variablesFiltroArreglo[0] + "'>" + $(".--subtemas-tematicas > .--active.level__2 .--nameSubtema").text() + "</th>";
        table += "<th data-dynatable-column='valor'>" + "Cantidad de Empresas" + "</th>";
    }

    var arrayFunctionReader = {};
    var arrayFunctionWriter = {};
    for (var i = 0; i < data.length; i++) {
        var tot = {}
        tot["cod_departamento"] = data[i]["CODIGO_F1"];
        tot["departamento"] = getDepartamento(data[i]["CODIGO_F1"]);
        if (getNivelesFiltro() == "0") {
            for (var h = 0; h < variablesArreglo.length; h++) {
                if (isFloat(parseFloat(data[i][variablesArreglo[h]]))) {
                    tot[RemoveAccents(variablesArreglo[h]).replace(/ /g, '').toLowerCase()] = parseFloat(parseFloat(data[i][variablesArreglo[h]]).toFixed(1)).toLocaleString("de-DE");
                } else {
                    tot[RemoveAccents(variablesArreglo[h]).replace(/ /g, '').toLowerCase()] = parseFloat(data[i][variablesArreglo[h]]) //.toLocaleString('de-DE')
                }
                arrayFunctionReader[RemoveAccents(variablesArreglo[h]).replace(/ /g, '').toLowerCase()] = function (el, record) {
                    return Number(el.innerHTML) || 0;
                }
                arrayFunctionWriter[RemoveAccents(variablesArreglo[h]).replace(/ /g, '').toLowerCase()] = function (record) {
                    return record[this.id] ? record[this.id].toLocaleString('de-DE') : 'n/a';
                }
            }
        }
        else {
            if (isFloat(parseFloat(data[i]["VALOR"]))) {
                tot["valor"] = parseFloat(parseFloat(data[i]["VALOR"]).toFixed(1)).toLocaleString("de-DE");
            }
            else {
                tot["valor"] = parseFloat(data[i]["VALOR"])
            }
            tot[variablesFiltroArreglo[0]] = getNameArreglo(data[i][variablesFiltroArreglo[0]]);

            arrayFunctionReader["valor"] = function (el, record) {
                return Number(el.innerHTML) || 0;
            }
            arrayFunctionWriter["valor"] = function (record) {
                return record["valor"] ? record["valor"].toLocaleString('de-DE') : 'n/a';
            }
        }
        if (getTieneAnio() == "S") { //ANIOS
            tot["anio"] = data[i]["ANIO"];
        }
        if ($("#FiltroGeograficoLvl1").val() != "-1") {
            tot["cod_municipio"] = data[i]["CODIGO_F2"];
            tot["municipio"] = getMpio(data[i]["CODIGO_F2"]);
        }

        arrayData.push(tot);
    }

    table += "</thead>" + "<tbody class='Geovisor__tableBox__tbody'>" + "</tbody>";
    $('.Geovisor__tableBox__tableContainer').html("");
    $('.Geovisor__tableBox__tableContainer').html("<div class='Geovisor__tableBox__tableContainer__overflow'><table id='tablaDatos' class='Geovisor__tableBox__tableContainer__table'></table></div>");
    $('#tablaDatos ').append(table);
    $('#tablaDatos').dynatable({
        dataset: {
            records: arrayData
        },
        features: {
            pushState: false,
        },
        readers: arrayFunctionReader,
        writers: arrayFunctionWriter
    }).bind('dynatable:afterProcess', changeClr);
    changeClr()

    function changeClr() {
        $('tr').each(function () {
            $(this).addClass('Geovisor__tableBox__tr');
            $(this).find('a').addClass('Geovisor__tableBox__th__link');
            $(this).find('th').addClass('Geovisor__tableBox__th');
            $(this).find('td').addClass('Geovisor__tableBox__tbody__td');
        })

        $(".Geovisor__tableBox__top__actionTable__export__button").on("click", function () {
            convertToCSV(arrayData, $(".level__2.--active .--nameSubtema").text().replaceAll(" ", "_"), true);
        })
    }
}
// */

//* Función - Carga info georreferenciada (sedes)
$var.Map.loadMarkers = function (infoMarkers) {

    // Instancias Google Maps
    var markerInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    // Carga estilos del mapa
    $var.Map.layers.layerDatos.setStyle(handleDataStyle);

    // Crea objeto con la información del marcador
    for (let i = 0; i < infoMarkers.length; i++) {
        const empresa = infoMarkers[i];
        // Excepción - Sólo para geovisor de Visualización (No edición)
        if (empresa.LATITUD != "0") { //  || empresa.LONGITUD != ""
            // c(empresa.LATITUD);
            // c(empresa.LONGITUD);
            var latitud = (empresa.LATITUD).replace(",", ".");
            var longitud = (empresa.LONGITUD).replace(",", ".");
            var tipDoc = empresa.TIPO_DOCUMENTO;
            var nit = empresa.NIT;
            var razonSoc = empresa.RAZON_SOCIAL;
            var nomComer = empresa.NOMBRE_COMERCIAL;
            var direccion = empresa.DIRECCION;
            var idDpto = empresa.MUNI_ID_DPTO;
            var idMpio = empresa.MUNI_ID_MPIO;
            var telefono = empresa.TELEFONO1;
            var ciiu3 = empresa.CIIU_ID_CIIU_3_V;
            var ciiu4 = empresa.CIIU_ID_CIIU_4_V;
            var cordSede = longitud + ", " + latitud;

            // Contenido por localización del mensaje (Pop-up)
            var contentString = '<b><font color="#8C1B48">Información Empresa:</font></b>' +
                // '<br><b>Tipo de Documento: </b>' +
                // tipDoc +
                '<br><b>Razón Social: </b>' +
                razonSoc +
                '<br><b>Nit: </b>' +
                nit +
                '<br><b>Nombre Comercial: </b>' +
                nomComer +
                '<br><b>Dirección: </b>' +
                direccion +
                '<br><b>Cód. Departamento: </b>' +
                idDpto +
                '<br><b>Cód. Municipio: </b>' +
                idMpio +
                '<br><b>Teléfono: </b>' +
                telefono +
                // '<br><b>Cod. Ciiu3: </b>' +
                // ciiu3 +
                '<br><b>Cod. Ciiu4: </b>' +
                ciiu4 +
                '<br><b>Coordenada geográfica : </b>' +
                cordSede +
                '<br>';

            var colorMarker = "src/images/GEOPORTAL-DANE-favicon-16x16.png";

            // Carga marcadores sobre el mapa
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(latitud, longitud),
                icon: colorMarker,
                map: $var.Map.map,
                animation: google.maps.Animation.DROP,
                content: contentString
            });

            bounds.extend(marker.position);
            $var.Map.visualMarkers.push(marker);

            marker.addListener("click", function () {
                // console.log(this.content);
                if ($('#ActionBar__identify__btn').hasClass('--active') == true) {
                    poblarInfoWindow(this, markerInfowindow);
                }
            });
        }
    }

    // if ($var.Map.address && $var.Map.address != "") {
    //     // Incializa y oculta selectores Geográficos
    //     $("#FiltroGeograficoLvl3").val("-1");
    //     $("#FiltroGeograficoLvl3").parent().addClass("--invisible");
    //     $("#FiltroGeograficoLvl2").val("-1");
    //     $("#FiltroGeograficoLvl2").parent().addClass("--invisible");
    //     $("#FiltroGeograficoLvl1").val("-1");
    //     // Zoom al total de puntos cargados en el Mapa (No al poligono del Dpto)
    //     $var.Map.map.fitBounds(bounds);
    //     $(".loader").removeClass('--active');
    // }

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    function poblarInfoWindow(marker, infowindow) {
        // console.log("poblarMarkers");
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent(marker.content);
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.setMarker = null;
            });
        }
    }
    loadSatelital();
}
// */

//* Carga la visualización del Mapa en cada iteración
function loadMapa(datum) {
    nombresLeyenda = []
    // Borra la capa Geojson seleccionada
    $var.Map.layers.layerDatos.forEach(function (feature) {
        $var.Map.layers.layerDatos.remove(feature);
    });
    if ($var.Map.map3D.getLayer('v')) {
        $var.Map.map3D.getLayer('v').remove();
    }
    // Por defecto cargue la geometría de Departamentos (cuando no hay selección Geográfica)
    if ($("#FiltroGeograficoLvl1").val() == "-1") {
        if (typeMapDivision == 0) {
            var uriAux = "./src/data/departamentos.json";
        }
        else {
            var uriAux = "./src/data/municipios.json";
        }
    } else {
        var uriAux = "./src/data/municipios/" + $("#FiltroGeograficoLvl1").val() + ".json";
    }

    // Carga el esqueleto del mapa sólo para la primera interacción
    if (!primeraCarga) {
        $.ajax({
            url: "./src/data/departamentos_principal.json",
            dataType: "JSON",
            success: function (data) {
                $var.Map.layers.base_dptos.addGeoJson(data)
                $var.Map.layers.base_dptos.setStyle(function () {
                    return ({
                        fillColor: 'white',
                        fillOpacity: 0,
                        strokeColor: '#A662CA',
                        strokeWeight: 1,
                        clickable: false,
                        zIndex: 100
                    });
                })
                for (var i = 0; i < labelsGeografia.length; i++) {
                    labelsGeografia[i].setMap(null);
                }
                labelsGeografia = [];
                for (var i = 0; i < data.features.length; i++) {
                    var bounds = new google.maps.LatLngBounds();
                    if (data.features[i].geometry.type == "Polygon") {
                        for (var j = 0; j < data.features[i].geometry.coordinates[0].length; j++) {
                            var myLatLng = new google.maps.LatLng(data.features[i].geometry.coordinates[0][j][1], data.features[i].geometry.coordinates[0][j][0]);
                            bounds.extend(myLatLng);
                        }
                    }
                    else {
                        for (var j = 0; j < data.features[i].geometry.coordinates.length; j++) {
                            for (var k = 0; k < data.features[i].geometry.coordinates[j].length; k++) {
                                for (var l = 0; l < data.features[i].geometry.coordinates[j][k].length; l++) {
                                    var myLatLng = new google.maps.LatLng(data.features[i].geometry.coordinates[j][k][l][1], data.features[i].geometry.coordinates[j][k][l][0]);
                                    bounds.extend(myLatLng);
                                }
                            }
                        }
                    }

                    // Código para mostrar etiquetas sobre el mapa (id o nombre)
                    var point = bounds.getCenter();
                    labelsGeografia.push(new InfoBox({
                        content: data.features[i].properties.DPTO_CNMBR,
                        boxStyle: {
                            //border: "1px solid black",
                            textAlign: "center",
                            "z-index": "-300",
                            "font-weight": "bold",
                            color: "black",
                            fontSize: "0.4rem",
                            "text-shadow": "rgb(255, 255, 255) 0px 0px 2px, rgb(255, 255, 255) 0px 0px 4px, rgb(255, 255, 255) 0px 0px 6px",
                            width: getAncho(data.features[i].properties.DPTO_CNMBR.length)
                        },
                        disableAutoPan: true,
                        pixelOffset: new google.maps.Size(getAnchoOffset(data.features[i].properties.DPTO_CNMBR.length), 0),
                        position: point,
                        closeBoxURL: "",
                        isHidden: false,
                        enableEventPropagation: true
                    }));
                    labelsGeografia[labelsGeografia.length - 1].open($var.Map.map);
                }
                primeraCarga = true;
                $.ajax({
                    url: uriAux,
                    dataType: "JSON",
                    success: function (data) {
                        settingMapa(data, datum)
                    }
                });
            }
        });
    } else {
        $.ajax({
            url: uriAux,
            dataType: "JSON",
            success: function (data) {
                settingMapa(data, datum)
            }
        });
    }
}
// */

//* Carga la configuración del Mapa en cada iteración y dos parámetros (data, datum);
// data: Parámetro con la geometría (json) de la UE seleccionada con datos asociados
// datum: Parámetro con los datos del servicio web con los datos calculados 
function settingMapa(data, datum) {
    if (typeMapDivision == 1) {
        listaDivipolaMpios = []
        for (var a = 0; a < data.features.length; a++) {
            listaDivipolaMpios.push([data.features[a].properties.MPIO_CCNCT, data.features[a].properties.MPIO_CNMBR])
        }
    }

    //c(new Date().getTime())

    loadPoblacion(data, datosPoblacion)
    datosMapa = data

    arrayTotales = []
    var bounds = new google.maps.LatLngBounds();
    var tipoDiv = getTipoDiv();
    var variableFiltro = "";
    var variableSeleccion = "";
    var arrayCortes = []
    var listaEntidadesG = [];
    var variablesArreglo = [];
    var variablesFiltroArreglo = [];
    var variablesNombreArreglo = [];

    for (var i = 0; i < listaVariables.length; i++) {
        if (listaVariables[i][0].substring(0, 5) == varSubtema) {
            variablesArreglo.push(listaVariables[i][1]);
            variablesFiltroArreglo.push(listaFilterVariables[i][1]);
            variablesNombreArreglo.push(listaNombresVariables[i][1]);
        }
        if (listaVariables[i][0] == $var.Map.varVariable) {
            variableSeleccion = listaVariables[i][1]
            variableFiltro = listaFilterVariables[i][1]
        }
    }

    // c(counties)

    for (var a = 0; a < listaUnidades.length; a++) {
        if ($var.Map.varVariable == listaUnidades[a][0]) {
            $(".functionAnalysis__slideTrans__textValue__legend").text(listaUnidades[a][1])
        }
    }

    // Carga los datos asociados a la entidad geográfica "seleccionada"
    for (var j = 0; j < datum.length; j++) {
        if ($("#FiltroGeograficoLvl1").val() == "-1") {
            if (typeMapDivision == 0) {
                listaEntidadesG.push(datum[j]["CODIGO_F1"]);
            }
            else {
                var codigo_municipio = datum[j]["CODIGO_F2"]
                if (datum[j]["CODIGO_F2"].length == 3) {
                    codigo_municipio = datum[j]["CODIGO_F1"] + datum[j]["CODIGO_F2"]
                }
                listaEntidadesG.push(codigo_municipio);
            }
        }
        else {
            var codigo_municipio = datum[j]["CODIGO_F2"]
            if (datum[j]["CODIGO_F2"].length == 3) {
                codigo_municipio = datum[j]["CODIGO_F1"] + datum[j]["CODIGO_F2"]
            }
            listaEntidadesG.push(codigo_municipio);
        }
        // TODO OTRA ENTIDAD GEOGRÁFICA
    }
    listaEntidadesG = listaEntidadesG.unique();

    // c(listaEntidadesG);

    for (var j = 0; j < listaEntidadesG.length; j++) {
        arrayTotales.push([listaEntidadesG[j], 0]);
    }
    arrayTotales.push(["0", 0]);
    // c(arrayTotales);

    // Se asignan los cálculos númericos, que visualmente se convierten en la saturación del color en mapa
    for (var i = 0; i < arrayTotales.length; i++) {
        for (var a = 0; a < datum.length; a++) {
            // Comparación antes del for cuando el geovisor incluye fecha
            // if(datum[a]["ANIO"] == $("#tiempoAnual").val()) {
            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                if (typeMapDivision == 0) {
                    if (arrayTotales[i][0] == datum[a]["CODIGO_F1"]) {
                        if (getTieneClase() == "S") {
                            if (getClase() == "0") {
                                if (getNivelesFiltro() == "0") {
                                    if (getVariableTotal() == "S") {
                                        arrayTotales[i][1] += parseFloat(getNumber(datum[a]["TOTAL_VAR"]).replace(",", "."))
                                    }
                                    else {
                                        if (tipoDiv == "VAC" || tipoDiv == "S") {
                                            for (var p = 0; p < variablesArreglo.length; p++) {
                                                if (variablesArreglo[p] == variableSeleccion) {
                                                    arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                                }
                                            }
                                        }
                                        else {
                                            for (var p = 0; p < variablesArreglo.length; p++) {
                                                arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                            }
                                        }
                                    }
                                }
                                else {
                                    arrayTotales[i][1] += parseFloat(getNumber(datum[a]["VALOR"]).replace(",", "."))
                                }
                            }
                            else {
                                if (datum[a]["CLASE"] == getClase()) {
                                    if (getNivelesFiltro() == "0") {
                                        if (getVariableTotal() == "S") {
                                            arrayTotales[i][1] += parseFloat(getNumber(datum[a]["TOTAL_VAR"]).replace(",", "."))
                                        }
                                        else {
                                            if (tipoDiv == "VAC" || tipoDiv == "S") {
                                                for (var p = 0; p < variablesArreglo.length; p++) {
                                                    if (variablesArreglo[p] == variableSeleccion) {
                                                        arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                                    }
                                                }
                                            }
                                            else {
                                                for (var p = 0; p < variablesArreglo.length; p++) {
                                                    arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        arrayTotales[i][1] += parseFloat(getNumber(datum[a]["VALOR"]).replace(",", "."))
                                    }
                                }
                            }
                        }
                        else {
                            if (getNivelesFiltro() == "0") {
                                if (getVariableTotal() == "S") {
                                    arrayTotales[i][1] += parseFloat(getNumber(datum[a]["TOTAL_VAR"]).replace(",", "."))

                                }
                                else {
                                    if (tipoDiv == "VAC" || tipoDiv == "S") {
                                        for (var p = 0; p < variablesArreglo.length; p++) {
                                            if (variablesArreglo[p] == variableSeleccion) {
                                                arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                            }
                                        }

                                    }
                                    else {
                                        for (var p = 0; p < variablesArreglo.length; p++) {
                                            arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                        }

                                    }
                                }
                            }
                            else {
                                arrayTotales[i][1] += parseFloat(getNumber(datum[a]["VALOR"]).replace(",", "."))

                            }
                        }
                    }
                }
                else {
                    var codigo_municipio = datum[a]["CODIGO_F2"]
                    if (datum[a]["CODIGO_F2"].length == 3) {
                        codigo_municipio = datum[a]["CODIGO_F1"] + datum[a]["CODIGO_F2"]
                    }
                    if (arrayTotales[i][0] == codigo_municipio) {
                        if (getTieneClase() == "S") {
                            if (getClase() == "0") {
                                if (getNivelesFiltro() == "0") {
                                    if (getVariableTotal() == "S") {
                                        arrayTotales[i][1] += parseFloat(getNumber(datum[a]["TOTAL_VAR"]).replace(",", "."))

                                    }
                                    else {
                                        if (tipoDiv == "VAC" || tipoDiv == "S") {
                                            for (var p = 0; p < variablesArreglo.length; p++) {
                                                if (variablesArreglo[p] == variableSeleccion) {
                                                    arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                                }
                                            }

                                        }
                                        else {
                                            for (var p = 0; p < variablesArreglo.length; p++) {
                                                arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                            }

                                        }
                                    }
                                }
                                else {
                                    arrayTotales[i][1] += parseFloat(getNumber(datum[a]["VALOR"]).replace(",", "."))

                                }
                            }
                            else {
                                if (datum[a]["CLASE"] == getClase()) {
                                    if (getNivelesFiltro() == "0") {
                                        if (getVariableTotal() == "S") {
                                            arrayTotales[i][1] += parseFloat(getNumber(datum[a]["TOTAL_VAR"]).replace(",", "."))

                                        }
                                        else {
                                            if (tipoDiv == "VAC" || tipoDiv == "S") {
                                                for (var p = 0; p < variablesArreglo.length; p++) {
                                                    if (variablesArreglo[p] == variableSeleccion) {
                                                        arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                                    }
                                                }

                                            }
                                            else {
                                                for (var p = 0; p < variablesArreglo.length; p++) {
                                                    arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                                }

                                            }
                                        }
                                    }
                                    else {
                                        arrayTotales[i][1] += parseFloat(getNumber(datum[a]["VALOR"]).replace(",", "."))

                                    }
                                }
                            }
                        }
                        else {
                            if (getNivelesFiltro() == "0") {
                                if (getVariableTotal() == "S") {
                                    arrayTotales[i][1] += parseFloat(getNumber(datum[a]["TOTAL_VAR"]).replace(",", "."))

                                }
                                else {
                                    if (tipoDiv == "VAC" || tipoDiv == "S") {
                                        for (var p = 0; p < variablesArreglo.length; p++) {
                                            if (variablesArreglo[p] == variableSeleccion) {
                                                arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                            }
                                        }

                                    }
                                    else {
                                        for (var p = 0; p < variablesArreglo.length; p++) {
                                            arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                        }

                                    }
                                }
                            }
                            else {
                                arrayTotales[i][1] += parseFloat(getNumber(datum[a]["VALOR"]).replace(",", "."))

                            }
                        }
                    }
                }
            } else {
                var codigo_municipio = datum[a]["CODIGO_F2"]
                if (datum[a]["CODIGO_F2"].length == 3) {
                    codigo_municipio = datum[a]["CODIGO_F1"] + datum[a]["CODIGO_F2"]
                }
                if (arrayTotales[i][0] == codigo_municipio) {
                    if (getTieneClase() == "S") {
                        if (getClase() == "0") {
                            if (getNivelesFiltro() == "0") {
                                if (getVariableTotal() == "S") {
                                    arrayTotales[i][1] += parseFloat(getNumber(datum[a]["TOTAL_VAR"]).replace(",", "."))

                                }
                                else {
                                    if (tipoDiv == "VAC" || tipoDiv == "S") {
                                        for (var p = 0; p < variablesArreglo.length; p++) {
                                            if (variablesArreglo[p] == variableSeleccion) {
                                                arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                            }
                                        }

                                    }
                                    else {
                                        for (var p = 0; p < variablesArreglo.length; p++) {
                                            arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                        }

                                    }
                                }
                            }
                            else {
                                arrayTotales[i][1] += parseFloat(getNumber(datum[a]["VALOR"]).replace(",", "."))

                            }
                        }
                        else {
                            if (datum[a]["CLASE"] == getClase()) {
                                if (getNivelesFiltro() == "0") {
                                    if (getVariableTotal() == "S") {
                                        arrayTotales[i][1] += parseFloat(getNumber(datum[a]["TOTAL_VAR"]).replace(",", "."))

                                    }
                                    else {
                                        if (tipoDiv == "VAC" || tipoDiv == "S") {
                                            for (var p = 0; p < variablesArreglo.length; p++) {
                                                if (variablesArreglo[p] == variableSeleccion) {
                                                    arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                                }
                                            }

                                        }
                                        else {
                                            for (var p = 0; p < variablesArreglo.length; p++) {
                                                arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                            }

                                        }
                                    }
                                }
                                else {
                                    arrayTotales[i][1] += parseFloat(getNumber(datum[a]["VALOR"]).replace(",", "."))

                                }
                            }
                        }
                    }
                    else {
                        if (getNivelesFiltro() == "0") {
                            if (getVariableTotal() == "S") {
                                arrayTotales[i][1] += parseFloat(getNumber(datum[a]["TOTAL_VAR"]).replace(",", "."))

                            }
                            else {
                                if (tipoDiv == "VAC" || tipoDiv == "S") {
                                    for (var p = 0; p < variablesArreglo.length; p++) {
                                        if (variablesArreglo[p] == variableSeleccion) {
                                            arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                        }
                                    }

                                }
                                else {
                                    for (var p = 0; p < variablesArreglo.length; p++) {
                                        arrayTotales[i][1] += parseFloat(getNumber(datum[a][variablesArreglo[p]]).replace(",", "."))
                                    }

                                }
                            }
                        }
                        else {
                            arrayTotales[i][1] += parseFloat(getNumber(datum[a]["VALOR"]).replace(",", "."))

                        }
                    }
                }

            }
            //}
        }
    }

    // c(arrayTotales)

    for (var j = 0; j < arrayTotales.length; j++) {
        arrayTotales[arrayTotales.length - 1][1] += arrayTotales[j][1]
    }

    var arrayFID = [];
    // Inicialización de la variable para visualizar en el mapa
    for (var i = 0; i < data.features.length; i++) {
        data.features[i].properties.VARIABLE = 0;
    }

    function getFID(array, value) {
        for (var m = 0; m < array.length; m++) {
            if (value == array[m]) return false;
        }
        return true;
    }


    var arrayFID = [];
    var sumValores;
    for (var i = 0; i < data.features.length; i++) {
        for (var j = 0; j < datum.length; j++) {
            // Comparación antes del for cuando el geovisor incluye fecha
            // if(datum[j]["ANIO"] == $("#tiempoAnual").val()){
            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                if (typeMapDivision == 0) {
                    if (data.features[i].properties.DPTO_CCDGO == datum[j]["CODIGO_F1"]) {
                        if (tipoDiv == "VAC" || tipoDiv == "S" || (tipoDiv == "C" && variablesArreglo.length == 1)) {
                            sumValores = arrayTotales[arrayTotales.length - 1][1]
                        }
                        else {
                            for (var a = 0; a < arrayTotales.length; a++) {
                                if (arrayTotales[a][0] == datum[j]["CODIGO_F1"]) {
                                    sumValores = arrayTotales[a][1]
                                }
                            }
                        }
                        if (getNivelesFiltro() == "0") {
                            var countyCode = data.features[i].properties.FID_ID;
                            if (getTieneClase() == "S") {
                                if (getClase() == "0") {
                                    if (tipoDiv == "VA") {
                                        data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j][variableSeleccion]).replace(",", "."));
                                        var county = counties.get(countyCode);
                                        county.set('variable', data.features[i].properties.VARIABLE);
                                        arrayFID.push(data.features[i].properties.FID_ID)
                                    }
                                    else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                        data.features[i].properties.VARIABLE += parseFloat(100 * getNumber(datum[j][variableSeleccion]).replace(",", ".") / sumValores);
                                        var county = counties.get(countyCode);
                                        county.set('variable', data.features[i].properties.VARIABLE);
                                        arrayFID.push(data.features[i].properties.FID_ID)
                                    }
                                }
                                else {
                                    if (datum[j]["CLASE"] == getClase()) {
                                        if (tipoDiv == "VA") {
                                            data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j][variableSeleccion]).replace(",", "."));
                                            var county = counties.get(countyCode);
                                            county.set('variable', data.features[i].properties.VARIABLE);
                                            arrayFID.push(data.features[i].properties.FID_ID)
                                        }
                                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                            data.features[i].properties.VARIABLE = parseFloat(100 * getNumber(datum[j][variableSeleccion]).replace(",", ".") / sumValores);
                                            var county = counties.get(countyCode);
                                            county.set('variable', data.features[i].properties.VARIABLE);
                                            arrayFID.push(data.features[i].properties.FID_ID)
                                        }
                                    }
                                }
                            }
                            else {
                                if (tipoDiv == "VA") {
                                    data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j][variableSeleccion]).replace(",", "."));
                                    var county = counties.get(countyCode);
                                    county.set('variable', data.features[i].properties.VARIABLE);
                                    arrayFID.push(data.features[i].properties.FID_ID)
                                }
                                else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                    data.features[i].properties.VARIABLE += parseFloat(100 * getNumber(datum[j][variableSeleccion]).replace(",", ".") / sumValores);
                                    var county = counties.get(countyCode);
                                    county.set('variable', data.features[i].properties.VARIABLE);
                                    arrayFID.push(data.features[i].properties.FID_ID)
                                }
                            }
                        }
                        else {
                            if (datum[j][variableFiltro] == variableSeleccion) {
                                var countyCode = data.features[i].properties.FID_ID;
                                if (getTieneClase() == "S") {
                                    if (getClase() == "0") {
                                        if (tipoDiv == "VA") {
                                            data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j]["VALOR"]).replace(",", "."));
                                            var county = counties.get(countyCode);
                                            county.set('variable', data.features[i].properties.VARIABLE);
                                            arrayFID.push(data.features[i].properties.FID_ID)
                                        }
                                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                            data.features[i].properties.VARIABLE += parseFloat(100 * getNumber(datum[j]["VALOR"]).replace(",", ".") / sumValores);
                                            var county = counties.get(countyCode);
                                            county.set('variable', data.features[i].properties.VARIABLE);
                                            arrayFID.push(data.features[i].properties.FID_ID)
                                        }
                                    }
                                    else {
                                        if (datum[j]["CLASE"] == getClase()) {
                                            if (tipoDiv == "VA") {
                                                data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j]["VALOR"]).replace(",", "."));
                                                var county = counties.get(countyCode);
                                                county.set('variable', data.features[i].properties.VARIABLE);
                                                arrayFID.push(data.features[i].properties.FID_ID)
                                            }
                                            else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                                data.features[i].properties.VARIABLE = parseFloat(100 * getNumber(datum[j]["VALOR"]).replace(",", ".") / sumValores);
                                                var county = counties.get(countyCode);
                                                county.set('variable', data.features[i].properties.VARIABLE);
                                                arrayFID.push(data.features[i].properties.FID_ID)
                                            }
                                        }
                                    }
                                }
                                else {
                                    if (tipoDiv == "VA") {
                                        data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j]["VALOR"]).replace(",", "."));
                                        var county = counties.get(countyCode);
                                        county.set('variable', data.features[i].properties.VARIABLE);
                                        arrayFID.push(data.features[i].properties.FID_ID)
                                    }
                                    else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                        data.features[i].properties.VARIABLE += parseFloat(100 * getNumber(datum[j]["VALOR"]).replace(",", ".") / sumValores);
                                        var county = counties.get(countyCode);
                                        // county.set('variable', data.features[i].properties.VARIABLE);
                                        arrayFID.push(data.features[i].properties.FID_ID)
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    var codigo_municipio = datum[j]["CODIGO_F2"]
                    if (datum[j]["CODIGO_F2"].length == 3) {
                        codigo_municipio = datum[j]["CODIGO_F1"] + datum[j]["CODIGO_F2"]
                    }
                    if (data.features[i].properties.MPIO_CCNCT == codigo_municipio) {
                        if (tipoDiv == "VAC" || tipoDiv == "S") {
                            sumValores = arrayTotales[arrayTotales.length - 1][1]
                        }
                        else {
                            for (var a = 0; a < arrayTotales.length; a++) {
                                if (arrayTotales[a][0] == codigo_municipio) {
                                    sumValores = arrayTotales[a][1]
                                }
                            }
                        }
                        if (getNivelesFiltro() == "0") {
                            var countyCode = data.features[i].properties.FID_ID;
                            if (getTieneClase() == "S") {
                                if (getClase() == "0") {
                                    if (tipoDiv == "VA") {
                                        data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j][variableSeleccion]).replace(",", "."));
                                        var county = counties.get(countyCode);
                                        county.set('variable', data.features[i].properties.VARIABLE);
                                        arrayFID.push(data.features[i].properties.FID_ID)
                                    }
                                    else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                        data.features[i].properties.VARIABLE = parseFloat(100 * getNumber(datum[j][variableSeleccion]).replace(",", ".") / sumValores);
                                        var county = counties.get(countyCode);
                                        county.set('variable', data.features[i].properties.VARIABLE);
                                        arrayFID.push(data.features[i].properties.FID_ID)
                                    }
                                }
                                else {
                                    if (datum[j]["CLASE"] == getClase()) {
                                        if (tipoDiv == "VA") {
                                            data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j][variableSeleccion]).replace(",", "."));
                                            var county = counties.get(countyCode);
                                            county.set('variable', data.features[i].properties.VARIABLE);
                                            arrayFID.push(data.features[i].properties.FID_ID)
                                        }
                                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                            data.features[i].properties.VARIABLE = parseFloat(100 * getNumber(datum[j][variableSeleccion]).replace(",", ".") / sumValores);
                                            var county = counties.get(countyCode);
                                            county.set('variable', data.features[i].properties.VARIABLE);
                                            arrayFID.push(data.features[i].properties.FID_ID)
                                        }
                                    }
                                }
                            }
                            else {
                                if (tipoDiv == "VA") {
                                    data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j][variableSeleccion]).replace(",", "."));
                                    var county = counties.get(countyCode);
                                    county.set('variable', data.features[i].properties.VARIABLE);
                                    arrayFID.push(data.features[i].properties.FID_ID)
                                }
                                else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                    data.features[i].properties.VARIABLE += parseFloat(100 * getNumber(datum[j][variableSeleccion]).replace(",", ".") / sumValores);
                                    var county = counties.get(countyCode);
                                    county.set('variable', data.features[i].properties.VARIABLE);
                                    arrayFID.push(data.features[i].properties.FID_ID)
                                }
                            }
                        }
                        else {
                            if (datum[j][variableFiltro] == variableSeleccion) {
                                var countyCode = data.features[i].properties.FID_ID;
                                if (getTieneClase() == "S") {
                                    if (getClase() == "0") {
                                        if (tipoDiv == "VA") {
                                            data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j]["VALOR"]).replace(",", "."));
                                            var county = counties.get(countyCode);
                                            county.set('variable', data.features[i].properties.VARIABLE);
                                            arrayFID.push(data.features[i].properties.FID_ID)
                                        }
                                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                            data.features[i].properties.VARIABLE = parseFloat(100 * getNumber(datum[j]["VALOR"]).replace(",", ".") / sumValores);
                                            var county = counties.get(countyCode);
                                            county.set('variable', data.features[i].properties.VARIABLE);
                                            arrayFID.push(data.features[i].properties.FID_ID)
                                        }
                                    }
                                    else {
                                        if (datum[j]["CLASE"] == getClase()) {
                                            if (tipoDiv == "VA") {
                                                data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j]["VALOR"]).replace(",", "."));
                                                var county = counties.get(countyCode);
                                                county.set('variable', data.features[i].properties.VARIABLE);
                                                arrayFID.push(data.features[i].properties.FID_ID)
                                            }
                                            else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                                data.features[i].properties.VARIABLE = parseFloat(100 * getNumber(datum[j]["VALOR"]).replace(",", ".") / sumValores);
                                                var county = counties.get(countyCode);
                                                county.set('variable', data.features[i].properties.VARIABLE);
                                                arrayFID.push(data.features[i].properties.FID_ID)
                                            }
                                        }
                                    }

                                }
                                else {
                                    if (tipoDiv == "VA") {
                                        data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j]["VALOR"]).replace(",", "."));
                                        var county = counties.get(countyCode);
                                        county.set('variable', data.features[i].properties.VARIABLE);
                                        arrayFID.push(data.features[i].properties.FID_ID)
                                    }
                                    else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                        data.features[i].properties.VARIABLE += parseFloat(100 * getNumber(datum[j]["VALOR"]).replace(",", ".") / sumValores);
                                        var county = counties.get(countyCode);
                                        county.set('variable', data.features[i].properties.VARIABLE);
                                        arrayFID.push(data.features[i].properties.FID_ID)
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                var codigo_municipio = datum[j]["CODIGO_F2"]
                if (datum[j]["CODIGO_F2"].length == 3) {
                    codigo_municipio = datum[j]["CODIGO_F1"] + datum[j]["CODIGO_F2"]
                }
                if (data.features[i].properties.MPIO_CCNCT == codigo_municipio) {
                    if (tipoDiv == "VAC" || tipoDiv == "S" || (tipoDiv == "C" && variablesArreglo.length == 1)) {
                        sumValores = arrayTotales[arrayTotales.length - 1][1]
                    }
                    else {
                        for (var a = 0; a < arrayTotales.length; a++) {
                            if (arrayTotales[a][0] == codigo_municipio) {
                                sumValores = arrayTotales[a][1]
                            }
                        }
                    }
                    if (getNivelesFiltro() == "0") {
                        var countyCode = data.features[i].properties.FID_ID;
                        if (getTieneClase() == "S") {
                            if (getClase() == "0") {
                                if (tipoDiv == "VA") {
                                    data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j][variableSeleccion]).replace(",", "."));
                                    var county = counties.get(countyCode);
                                    county.set('variable', data.features[i].properties.VARIABLE);
                                    arrayFID.push(data.features[i].properties.FID_ID)
                                }
                                else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                    data.features[i].properties.VARIABLE += parseFloat(100 * getNumber(datum[j][variableSeleccion]).replace(",", ".") / sumValores);
                                    var county = counties.get(countyCode);
                                    county.set('variable', data.features[i].properties.VARIABLE);
                                    arrayFID.push(data.features[i].properties.FID_ID)
                                }
                            }
                            else {
                                if (datum[j]["CLASE"] == getClase()) {
                                    if (tipoDiv == "VA") {
                                        data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j][variableSeleccion]).replace(",", "."));
                                        var county = counties.get(countyCode);
                                        county.set('variable', data.features[i].properties.VARIABLE);
                                        arrayFID.push(data.features[i].properties.FID_ID)
                                    }
                                    else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                        data.features[i].properties.VARIABLE += parseFloat(100 * getNumber(datum[j][variableSeleccion]).replace(",", ".") / sumValores);
                                        var county = counties.get(countyCode);
                                        county.set('variable', data.features[i].properties.VARIABLE);
                                        arrayFID.push(data.features[i].properties.FID_ID)
                                    }
                                }
                            }
                        }
                        else {
                            if (tipoDiv == "VA") {
                                data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j][variableSeleccion]).replace(",", "."));
                                var county = counties.get(countyCode);
                                county.set('variable', data.features[i].properties.VARIABLE);
                                arrayFID.push(data.features[i].properties.FID_ID)
                            }
                            else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                data.features[i].properties.VARIABLE += parseFloat(100 * getNumber(datum[j][variableSeleccion]).replace(",", ".") / sumValores);
                                var county = counties.get(countyCode);
                                county.set('variable', data.features[i].properties.VARIABLE);
                                arrayFID.push(data.features[i].properties.FID_ID)
                            }
                        }
                    }
                    else {
                        if (datum[j][variableFiltro] == variableSeleccion) {
                            var countyCode = data.features[i].properties.FID_ID;
                            if (getTieneClase() == "S") {
                                if (getClase() == "0") {
                                    if (tipoDiv == "VA") {
                                        data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j]["VALOR"]).replace(",", "."));
                                        var county = counties.get(countyCode);
                                        county.set('variable', data.features[i].properties.VARIABLE);
                                        arrayFID.push(data.features[i].properties.FID_ID)
                                    }
                                    else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                        data.features[i].properties.VARIABLE += parseFloat(100 * getNumber(datum[j]["VALOR"]).replace(",", ".") / sumValores);
                                        var county = counties.get(countyCode);
                                        county.set('variable', data.features[i].properties.VARIABLE);
                                        arrayFID.push(data.features[i].properties.FID_ID)
                                    }
                                }
                                else {
                                    if (datum[j]["CLASE"] == getClase()) {
                                        if (tipoDiv == "VA") {
                                            data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j]["VALOR"]).replace(",", "."));
                                            var county = counties.get(countyCode);
                                            county.set('variable', data.features[i].properties.VARIABLE);
                                            arrayFID.push(data.features[i].properties.FID_ID)
                                        }
                                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                            data.features[i].properties.VARIABLE += parseFloat(100 * getNumber(datum[j]["VALOR"]).replace(",", ".") / sumValores);
                                            var county = counties.get(countyCode);
                                            county.set('variable', data.features[i].properties.VARIABLE);
                                            arrayFID.push(data.features[i].properties.FID_ID)
                                        }
                                    }
                                }
                            }
                            else {
                                if (tipoDiv == "VA") {
                                    data.features[i].properties.VARIABLE = parseFloat(getNumber(datum[j]["VALOR"]).replace(",", "."));
                                    var county = counties.get(countyCode);
                                    county.set('variable', data.features[i].properties.VARIABLE);
                                    arrayFID.push(data.features[i].properties.FID_ID)
                                }
                                else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                    data.features[i].properties.VARIABLE += parseFloat(100 * getNumber(datum[j]["VALOR"]).replace(",", ".") / sumValores);
                                    var county = counties.get(countyCode);
                                    county.set('variable', data.features[i].properties.VARIABLE);
                                    arrayFID.push(data.features[i].properties.FID_ID)
                                }
                            }
                        }
                    }
                }
            }
            //  }
        }
    }

    for (var i = 0; i < data.features.length; i++) {
        arrayCortes.push(data.features[i].properties.VARIABLE);
        if (data.features[i].properties.VARIABLE != null) {
            var myLatLng;
            for (var j = 0; j < data.features[i].geometry.coordinates[0].length; j++) {
                if (data.features[i].geometry.coordinates[0][j].length > 2) {
                    for (var x = 0; x < data.features[i].geometry.coordinates[0][j].length; x++) {
                        myLatLng = new google.maps.LatLng(data.features[i].geometry.coordinates[0][j][x][1], data.features[i].geometry.coordinates[0][j][x][0]);
                    }
                } else {
                    myLatLng = new google.maps.LatLng(data.features[i].geometry.coordinates[0][j][1], data.features[i].geometry.coordinates[0][j][0]);
                }

                bounds.extend(myLatLng);
            }
        }
    }

    // c(data.features)

    arrayCortes = arrayCortes.unique();
    arrayCortes = arrayCortes.filter(Boolean);

    loadBarsEntidades(datosPoblacion)
    // Si segmentos leyenda vienen vacíos oculta el gráfico de frecuencia
    if (arrayCortes.length != 0) {
        loadCortes(arrayCortes);
        loadLeyenda(datum);
        loadBarsFrecuencia(data, datum)
    } else {
        d3.select(".map__legend svg").remove();
        d3.select("#frequencyGraph").remove();
        // alert("No se encontraron resultados para el filtro realizado");
    }

    //* Función - Crea el mapa de perspectiva y agrega los poligonos sobre el mismo.
    $var.Map.layers3D.layerDatos = new maptalks.VectorLayer('v')
        .addTo($var.Map.map3D);

    var marker = maptalks.GeoJSON.toGeometry(data); //.addTo($var.Map.map3D.getLayer('v'));

    for (var i = 0; i < marker.length; i++) {
        if (marker[i].properties.VARIABLE != null) {
            marker[i].setSymbol(getSymbol(marker[i].properties.VARIABLE));
            marker[i].addTo($var.Map.layers3D.layerDatos);
            marker[i].on('mouseenter', function (e) {
                setTimeout(function () {
                    d3.select(".tooltip").remove();
                    div = d3.select("body")
                        .append("div")
                        .attr("class", "tooltip");

                    if (e.target.getProperties().VARIABLE != null) {
                        if ($("#FiltroGeograficoLvl1").val() == "-1") {
                            if (typeMapDivision == 0) {
                                if (tipoDiv == "VA") {
                                    var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Departamento:</strong> " + e.target.getProperties().DPTO_CCDGO + " - " + e.target.getProperties().DPTO_CNMBR + "</p>"
                                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + (getNumber(e.target.getProperties().VARIABLE)).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + "<br>" + "</p>";
                                }
                                else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                    var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Departamento:</strong> " + e.target.getProperties().DPTO_CCDGO + " - " + e.target.getProperties().DPTO_CNMBR + "</p>"
                                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + parseFloat(parseFloat(getNumber(e.target.getProperties().VARIABLE)).toFixed(1)).toLocaleString("de-DE") + "% (" + getValorPorcentaje(getNumber(e.target.getProperties().VARIABLE), e.target.getProperties().DPTO_CCDGO).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + ")<br>" + "</p>";
                                }
                            }
                            else {
                                if (tipoDiv == "VA") {
                                    var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Municipio:</strong> " + e.target.getProperties().MPIO_CCNCT + " - " + e.target.getProperties().MPIO_CNMBR + "</p>"
                                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + (getNumber(e.target.getProperties().VARIABLE)).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + "<br>" + "</p>";
                                }
                                else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                    var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Municipio:</strong> " + e.target.getProperties().MPIO_CCNCT + " - " + e.target.getProperties().MPIO_CNMBR + "</p>"
                                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + parseFloat(parseFloat(getNumber(e.target.getProperties().VARIABLE)).toFixed(1)).toLocaleString("de-DE") + "% (" + getValorPorcentaje(getNumber(e.target.getProperties().VARIABLE), e.target.getProperties().DPTO_CCDGO).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + ")<br>" + "</p>";
                                }
                            }
                        }
                        else {
                            if (tipoDiv == "VA") {
                                var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                    + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Departamento:</strong> " + e.target.getProperties().DPTO_CCDGO + " - " + e.target.getProperties().DPTO_CNMBR + "</p>"
                                    + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Municipio:</strong> " + e.target.getProperties().MPIO_CCNCT + " - " + e.target.getProperties().MPIO_CNMBR + "</p>"
                                    + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + (getNumber(e.target.getProperties().VARIABLE)).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + ")<br>" + "</p>";
                            }
                            else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                    + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Departamento:</strong> " + e.target.getProperties().DPTO_CCDGO + " - " + e.target.getProperties().DPTO_CNMBR + "</p>"
                                    + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Municipio:</strong> " + e.target.getProperties().MPIO_CCNCT + " - " + e.target.getProperties().MPIO_CNMBR + "</p>"
                                    + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + parseFloat(parseFloat(getNumber(e.target.getProperties().VARIABLE)).toFixed(1)).toLocaleString("de-DE") + "% (" + getValorPorcentaje(getNumber(e.target.getProperties().VARIABLE), e.target.getProperties().MPIO_CCNCT).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + ")<br>" + "</p>";
                            }
                        }

                        div.selectAll("text").remove();
                        div.append("text")
                            .html(contentString);
                        div.style("left", (e.domEvent.clientX + 40) + "px")
                            .style("top", (e.domEvent.clientY) + "px");
                    }
                }, 300);
            });
            marker[i].on("mouseover", function (e) {
                $var.Map.screenCoord =
                    'Latitud: ' + $var.Map.sixDecimal(e.coordinate.y) +
                    ' Longitud: ' + $var.Map.sixDecimal(e.coordinate.x);
                $('.map__coord__value').html('');
                $('.map__coord__value').append($var.Map.screenCoord);

                div.style("left", (e.domEvent.clientX + 40) + "px")
                    .style("top", (e.domEvent.clientY) + "px");
            })
            marker[i].on("mouseout", function (e) {
                div.remove();
            })
        }
    }
    //c($var.Map.layers3D.layerDatos)
    //c($var.Map.layers3D.layerDatos.getExtent())
    $var.Map.map3D.fitExtent($var.Map.layers3D.layerDatos.getExtent(), 1);

    // Hace el zoom sobre el elemento geográfico seleccionado
    // if(urlGet.search == ""){
    if (arrayCortes.length != 0) {
        $var.Map.map.fitBounds(bounds);
    }
    // }

    //c(new Date().getTime())


    if (typeMap == "1") {
        loadCirculos(data)
        loadLeyendaCirculos(data)
        //$var.Map.layers.layerDatos.addGeoJson(data)
        $var.Map.layers.layerDatos.setStyle(handleDataStyle);
    } else {
        if (getTieneClase() == "S") {
            if (filtroArea == "0" || filtroArea == "4") {
                $var.Map.layers.layerDatos.addGeoJson(data)
                $var.Map.layers.layerDatos.setStyle(handleDataStyle);
            }
            else {
                loadCirculos(data)
                loadLeyendaCirculos(data)
                $var.Map.layers.layerDatos.addGeoJson(data)
                $var.Map.layers.layerDatos.setStyle(handleDataStyle);
            }
        }
        else {
            $var.Map.layers.layerDatos.addGeoJson(data)
            $var.Map.layers.layerDatos.setStyle(handleDataStyle);
        }
    }

    //* Función - Zoom sin recargar estadísticas
    if ($("#FiltroGeograficoLvl1").val() != "-1" && $("#FiltroGeograficoLvl2").val() != "-1") {
        $var.Map.layers.layerDatos.forEach(function (feature) {
            if (feature.getProperty("MPIO_CCNCT") == $("#FiltroGeograficoLvl2").val()) {
                var bounds = new google.maps.LatLngBounds();
                feature.getGeometry().forEachLatLng(function (a) {
                    var myLatLng = new google.maps.LatLng(a.lat(), a.lng());
                    bounds.extend(myLatLng);
                })
                $var.Map.map.fitBounds(bounds);
            }
        });
    }


    google.maps.event.clearListeners($var.Map.layers.layerDatos, 'mouseover');
    google.maps.event.addListener($var.Map.layers.layerDatos, 'mouseover', function (event) {
        if ($var.Map.clickableLayer) {
            d3.select(".tooltip").remove();
            div = d3.select("body")
                .append("div")
                .attr("class", "tooltip");

            if (event.feature.getProperty("VARIABLE") != null) {
                if ($("#FiltroGeograficoLvl1").val() == "-1") {
                    if (typeMapDivision == 0) {
                        if (tipoDiv == "VA") {
                            var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Departamento:</strong> " + event.feature.getProperty("DPTO_CCDGO") + " - " + event.feature.getProperty("DPTO_CNMBR") + "</p>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + (getNumber(event.feature.getProperty("VARIABLE"))).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + "<br>" + "</p>";
                        }
                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                            var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Departamento:</strong> " + event.feature.getProperty("DPTO_CCDGO") + " - " + event.feature.getProperty("DPTO_CNMBR") + "</p>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + parseFloat(parseFloat(getNumber(event.feature.getProperty("VARIABLE"))).toFixed(1)).toLocaleString("de-DE") + "% (" + getValorPorcentaje(getNumber(event.feature.getProperty("VARIABLE")), event.feature.getProperty("DPTO_CCDGO")).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + ")<br>" + "</p>";
                        }
                    }
                    else {
                        if (tipoDiv == "VA") {
                            var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Municipio:</strong> " + event.feature.getProperty("MPIO_CCNCT") + " - " + event.feature.getProperty("MPIO_CNMBR") + "</p>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + (getNumber(event.feature.getProperty("VARIABLE"))).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + "<br>" + "</p>";
                        }
                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                            var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Municipio:</strong> " + event.feature.getProperty("MPIO_CCNCT") + " - " + event.feature.getProperty("MPIO_CNMBR") + "</p>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + parseFloat(parseFloat(getNumber(event.feature.getProperty("VARIABLE"))).toFixed(1)).toLocaleString("de-DE") + "% (" + getValorPorcentaje(getNumber(event.feature.getProperty("VARIABLE")), event.feature.getProperty("DPTO_CCDGO")).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + ")<br>" + "</p>";
                        }
                    }
                } else {
                    if (tipoDiv == "VA") {
                        var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                            + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Departamento:</strong> " + event.feature.getProperty("DPTO_CCDGO") + " - " + event.feature.getProperty("DPTO_CNMBR") + "</p>"
                            + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Municipio:</strong> " + event.feature.getProperty("MPIO_CCNCT") + " - " + event.feature.getProperty("MPIO_CNMBR") + "</p>"
                            + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + (getNumber(event.feature.getProperty("VARIABLE"))).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + ")<br>" + "</p>";
                    }
                    else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                        var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                            + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Departamento:</strong> " + event.feature.getProperty("DPTO_CCDGO") + " - " + event.feature.getProperty("DPTO_CNMBR") + "</p>"
                            + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Municipio:</strong> " + event.feature.getProperty("MPIO_CCNCT") + " - " + event.feature.getProperty("MPIO_CNMBR") + "</p>"
                            + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + parseFloat(parseFloat(getNumber(event.feature.getProperty("VARIABLE"))).toFixed(1)).toLocaleString("de-DE") + "% (" + getValorPorcentaje(getNumber(event.feature.getProperty("VARIABLE")), event.feature.getProperty("MPIO_CCNCT")).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + ")<br>" + "</p>";
                    }
                }

                // console.log(event);
                div.selectAll("text").remove();
                div.append("text")
                    .html(contentString);
                div.style("left", (event.domEvent.pageX + 40) + "px")
                    .style("top", (event.domEvent.pageY) + "px");
            }
        }
    });

    google.maps.event.clearListeners($var.Map.layers.layerDatos, 'mousemove');
    google.maps.event.addListener($var.Map.layers.layerDatos, 'mousemove', function (event) {
        $var.Map.screenCoord =
            'Latitud: ' + $var.Map.sixDecimal(event.latLng.lat()) +
            ' Longitud: ' + $var.Map.sixDecimal(event.latLng.lng());
        $('.map__coord__value').html('');
        $('.map__coord__value').append($var.Map.screenCoord);

        div.style("left", (event.domEvent.pageX + 40) + "px")
            .style("top", (event.domEvent.pageY) + "px");
    });

    google.maps.event.clearListeners($var.Map.layers.layerDatos, 'mouseout');
    google.maps.event.addListener($var.Map.layers.layerDatos, 'mouseout', function (event) {
        if ($var.Map.clickableLayer) {
            div.remove();
        }
    });

    // Al seleccionar un elemento geográfico en mapa carga el nombre de entidad geográfica en la lista
    // desplegable y lanza la función que carga la información estadística del elemento seleccionado
    google.maps.event.clearListeners($var.Map.layers.layerDatos, 'click');
    google.maps.event.addListener($var.Map.layers.layerDatos, 'click', function (event) {
        if ($var.Map.clickableLayer && event.feature.getProperty("VARIABLE") != null) {
            $(".loader").addClass('--active');
            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                // c(event.feature.getProperty("DPTO_CCDGO"));
                $("#FiltroGeograficoLvl1").val(event.feature.getProperty("DPTO_CCDGO"));
                filtroGeoLvI(event.feature.getProperty("DPTO_CCDGO"));
            } else {
                $("#FiltroGeograficoLvl2").val(event.feature.getProperty("MPIO_CCNCT"))
                filtroGeoLv2(event.feature.getProperty("MPIO_CCNCT"));
                $("#place__municipality").text(($("#FiltroGeograficoLvl2 :selected").text()));
                $("#results__panel__title__site").text($("#FiltroGeograficoLvl1 :selected").text() + " - " + ($("#FiltroGeograficoLvl2 :selected").text()));
            }
        }
    });

    $(".loader").removeClass('--active');
}

function loadPoblacion(data, datosPoblacion) {
    //DATA: DATOS GEOGRÁFICOS, DATOSPOBLACION: DATOS ALFANÚMERICOS
    arrayMax = []
    counties = d3.map();
    var tipoDiv = getTipoDiv();
    var variablesArreglo = [];
    var variablesFiltroArreglo = [];
    var variablesCodigoArreglo = [];

    for (var i = 0; i < listaVariables.length; i++) {
        if (listaVariables[i][0].substring(0, 5) == varSubtema) {
            variablesArreglo.push(listaVariables[i][1]);
            variablesCodigoArreglo.push(listaVariables[i][0]);
            variablesFiltroArreglo.push(listaFilterVariables[i][1]);
        }
        if (listaVariables[i][0] == $var.Map.varVariable) {
            variableSeleccion = listaVariables[i][1]
            variableFiltro = listaFilterVariables[i][1]
        }
    }

    // c(new Date().getTime())
    for (var i = 0; i < data.features.length; i++) {
        var dataVariableAltura = d3.map();
        for (var b = 0; b < variablesCodigoArreglo.length; b++) {
            dataVariableAltura.set(variablesCodigoArreglo[b], 0);
        }
        for (var j = 0; j < datosPoblacion.length; j++) {
            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                if (typeMapDivision == 0) {
                    if (data.features[i].properties.DPTO_CCDGO == datosPoblacion[j]["CODIGO_F1"]) {
                        dataVariableAltura.set("code", data.features[i].properties.DPTO_CCDGO);
                        var countyCode = data.features[i].properties.FID_ID;
                        if (getNivelesFiltro() == "0") {
                            for (var b = 0; b < variablesCodigoArreglo.length; b++) {
                                var aux = dataVariableAltura.get(variablesCodigoArreglo[b]);
                                if (getTieneClase() == "S") {
                                    if (getClase() == "0") {
                                        if (tipoDiv == "VA") {
                                            aux = parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                        }
                                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                            aux += parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                        }
                                    }
                                    else {
                                        if (datosPoblacion[j]["CLASE"] == getClase()) {
                                            if (tipoDiv == "VA") {
                                                aux = parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                            }
                                            else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                                aux += parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                            }
                                        }
                                    }
                                }
                                else {
                                    if (tipoDiv == "VA") {
                                        aux = parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                    }
                                    else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                        aux += parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                    }
                                }
                                dataVariableAltura.set(variablesCodigoArreglo[b], aux);
                                counties.set(countyCode, dataVariableAltura);
                            }
                        }
                        else {
                            for (var b = 0; b < variablesCodigoArreglo.length; b++) {
                                if (datosPoblacion[j][variablesFiltroArreglo[b]] == variablesArreglo[b]) {
                                    var aux = dataVariableAltura.get(variablesCodigoArreglo[b]);

                                    if (getTieneClase() == "S") {
                                        if (getClase() == "0") {
                                            if (tipoDiv == "VA") {
                                                aux = parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                                break;
                                            }
                                            else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                                aux += parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                            }
                                        }
                                        else {
                                            if (datosPoblacion[j]["CLASE"] == getClase()) {
                                                if (tipoDiv == "VA") {
                                                    aux = parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                                    break;
                                                }
                                                else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                                    aux += parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        if (tipoDiv == "VA") {
                                            aux = parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                            break;
                                        }
                                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                            aux += parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                        }
                                    }
                                    dataVariableAltura.set(variablesCodigoArreglo[b], aux);
                                    counties.set(countyCode, dataVariableAltura);
                                }
                            }
                        }
                    }
                } else {
                    var codigo_municipio = datosPoblacion[j]["CODIGO_F2"]
                    if (datosPoblacion[j]["CODIGO_F2"].length == 3) {
                        codigo_municipio = datosPoblacion[j]["CODIGO_F1"] + datosPoblacion[j]["CODIGO_F2"]
                    }
                    if (data.features[i].properties.MPIO_CCNCT == codigo_municipio) {
                        dataVariableAltura.set("code", data.features[i].properties.MPIO_CCNCT);
                        var countyCode = data.features[i].properties.FID_ID;
                        if (getNivelesFiltro() == "0") {
                            for (var b = 0; b < variablesCodigoArreglo.length; b++) {
                                var aux = dataVariableAltura.get(variablesCodigoArreglo[b]);

                                if (getTieneClase() == "S") {
                                    if (getClase() == "0") {
                                        if (tipoDiv == "VA") {
                                            aux = parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                        }
                                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                            aux += parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                        }
                                    }
                                    else {
                                        if (datosPoblacion[j]["CLASE"] == getClase()) {
                                            if (tipoDiv == "VA") {
                                                aux = parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                            }
                                            else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                                aux += parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                            }
                                        }
                                    }

                                }
                                else {
                                    if (tipoDiv == "VA") {
                                        aux = parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                    }
                                    else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                        aux += parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                    }
                                }
                                dataVariableAltura.set(variablesCodigoArreglo[b], aux);
                                counties.set(countyCode, dataVariableAltura);
                            }
                        }
                        else {
                            for (var b = 0; b < variablesCodigoArreglo.length; b++) {
                                if (datosPoblacion[j][variablesFiltroArreglo[b]] == variablesArreglo[b]) {
                                    var aux = dataVariableAltura.get(variablesCodigoArreglo[b]);

                                    if (getTieneClase() == "S") {
                                        if (getClase() == "0") {
                                            if (tipoDiv == "VA") {
                                                aux = parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                            }
                                            else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                                aux += parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                            }
                                        }
                                        else {
                                            if (datosPoblacion[j]["CLASE"] == getClase()) {
                                                if (tipoDiv == "VA") {
                                                    aux = parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                                }
                                                else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                                    aux += parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        if (tipoDiv == "VA") {
                                            aux = parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                        }
                                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                            aux += parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                        }
                                    }
                                    dataVariableAltura.set(variablesCodigoArreglo[b], aux);
                                    counties.set(countyCode, dataVariableAltura);
                                }
                            }
                        }
                    }
                }
            }
            else {
                var codigo_municipio = datosPoblacion[j]["CODIGO_F2"]
                if (datosPoblacion[j]["CODIGO_F2"].length == 3) {
                    codigo_municipio = datosPoblacion[j]["CODIGO_F1"] + datosPoblacion[j]["CODIGO_F2"]
                }
                if (data.features[i].properties.MPIO_CCNCT == codigo_municipio) {
                    dataVariableAltura.set("code", data.features[i].properties.MPIO_CCNCT);
                    var countyCode = data.features[i].properties.FID_ID;
                    if (getNivelesFiltro() == "0") {
                        for (var b = 0; b < variablesCodigoArreglo.length; b++) {
                            var aux = dataVariableAltura.get(variablesCodigoArreglo[b]);

                            if (getTieneClase() == "S") {
                                if (getClase() == "0") {
                                    if (tipoDiv == "VA") {
                                        aux = parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                    }
                                    else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                        aux += parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                    }
                                }
                                else {
                                    if (datosPoblacion[j]["CLASE"] == getClase()) {
                                        if (tipoDiv == "VA") {
                                            aux = parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                        }
                                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                            aux += parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                        }
                                    }
                                }

                            }
                            else {
                                if (tipoDiv == "VA") {
                                    aux = parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                }
                                else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                    aux += parseFloat(getNumber(datosPoblacion[j][variablesArreglo[b]]).replace(",", "."));
                                }
                            }
                            dataVariableAltura.set(variablesCodigoArreglo[b], aux);
                            counties.set(countyCode, dataVariableAltura);
                        }
                    }
                    else {
                        for (var b = 0; b < variablesCodigoArreglo.length; b++) {
                            if (datosPoblacion[j][variablesFiltroArreglo[b]] == variablesArreglo[b]) {
                                var aux = dataVariableAltura.get(variablesCodigoArreglo[b]);

                                if (getTieneClase() == "S") {
                                    if (getClase() == "0") {
                                        if (tipoDiv == "VA") {
                                            aux = parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                        }
                                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                            aux += parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                        }
                                    }
                                    else {
                                        if (datosPoblacion[j]["CLASE"] == getClase()) {
                                            if (tipoDiv == "VA") {
                                                aux = parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                            }
                                            else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                                aux += parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                            }
                                        }
                                    }
                                }
                                else {
                                    if (tipoDiv == "VA") {
                                        aux = parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                    }
                                    else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                                        aux += parseFloat(getNumber(datosPoblacion[j]["VALOR"]).replace(",", "."));
                                    }
                                }
                                dataVariableAltura.set(variablesCodigoArreglo[b], aux);
                                counties.set(countyCode, dataVariableAltura);
                            }
                        }
                    }
                }
            }
        }
    }
    // c(new Date().getTime())
    counties.forEach(function (d, a) {
        arrayMax.push(a.get($("#variable3D").val()));
    })
    max_population = d3.max(arrayMax)
    min_population = d3.min(arrayMax)

    // c(counties)

    getExtrusion = d3.scale.linear().domain([min_population, max_population]).range([0, MAX_EXTRUSION]);
}

function loadLeyenda() {
    var color = getColorArray();

    if (colorClass != "") {
        var color = colorClass;
    }

    if (resultadoCortes.length == 1) {
        color = [color[4]];
    }
    if (resultadoCortes.length == 2) {
        color = [color[4]]
    }
    if (resultadoCortes.length == 3) {
        color = [color[4], color[5]]
    }
    if (resultadoCortes.length == 4) {
        color = [color[2], color[4], color[6]]
    }
    if (resultadoCortes.length == 5) {
        color = [color[2], color[4], color[6], color[8]]
    }
    if (resultadoCortes.length == 6) {
        color = [color[0], color[2], color[4], color[6], color[8]]
    }
    if (resultadoCortes.length == 7) {
        color = [color[0], color[2], color[4], color[5], color[6], color[8]]
    }
    if (resultadoCortes.length == 8) {
        color = [color[0], color[2], color[3], color[4], color[5], color[6], color[8]]
    }
    if (resultadoCortes.length == 9) {
        color = [color[0], color[1], color[2], color[3], color[4], color[5], color[6], color[8]]
    }
    if (resultadoCortes.length == 9) {
        color = [color[0], color[1], color[2], color[3], color[4], color[5], color[6], color[7], color[8]]
    }

    var tipoDiv;
    tipoDiv = getTipoDiv();
    var titulo = getNombreVariable($var.Map.varVariable)
    if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
        var unidad = "%";
    }
    else {
        var unidad = getUnidades($var.Map.varVariable);
    }



    // var tipoDiv;
    // tipoDiv = getTipoDiv();
    // if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC"  || tipoDiv == "S") {
    //     var titulo = getNombreVariable ($var.Map.varVariable) + " (%)";
    // }
    // // else {
    // //     var titulo = getNombreVariable ($var.Map.varVariable) + " (" + getUnidades ($var.Map.varVariable) + ")";
    // // }
    // var lengthTitulo = titulo.length;
    // var width = 180 //(lengthTitulo * 5) + 40
    // var height = (nombresLeyenda.length * 20) + 80


    $('.map__legend__list').empty();
    // c(color,nombresLeyenda)
    color.map(function (obj, j, k) {
        var listaTemp = $('<li/>', { class: 'results__LegendItem ' });
        let square = $('<svg/>', { class: 'results__LegendItemSquare', style: 'background:' + color[j] });
        let text = $('<p/>', { class: 'results__LegendItemData', text: " " + nombresLeyenda[j].split('-')[0] + unidad + ' -  ' + nombresLeyenda[j].split('-')[1] + unidad })
        square.appendTo(listaTemp);
        text.appendTo(listaTemp);
        listaTemp.appendTo('.map__legend__list');
    }, []);
    $('.legendTitle').empty().text(titulo)
    $('.results__panel__subtitle__themeName.unidad').empty().text('(' + unidad + ')');
    $('.legendClasi').empty().text('Clasificación de datos: ' + $("#functionPalette__classMethod :selected").text())

}


function loadLeyendaCirculos(data) {
    var arrayDatos = []
    for (var i = 0; i < data.features.length; i++) {
        if ($("#FiltroGeograficoLvl1").val() == "-1") {
            arrayDatos.push(parseFloat(getValorPorcentaje(data.features[i].properties.VARIABLE, data.features[i].properties.DPTO_CCDGO)))
        }
        else {
            arrayDatos.push(parseFloat(getValorPorcentaje(data.features[i].properties.VARIABLE, data.features[i].properties.MPIO_CCNCT)))
        }
    }
    var max = d3.max(arrayDatos)
    var min = d3.min(arrayDatos)
    // TO DO PARA MENOS DE 5 VALORES 
    // TO DO REVISAR EL GRÁFICO DE FRECUENCIAS


    var color = ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3'];

    var colorPrincipal = '#bf812d';
    for (var i = 0; i < listaColores.length; i++) {
        if (listaColores[i][0] == $var.Map.varVariable) {
            colorPrincipal = listaColores[i][1].split(",");
        }
    }
    var colorMedium = chroma(colorPrincipal).get('hsl.l');
    var arrayColores = []
    if (colorMedium > 1) {
        arrayColores = [1, 0, colorMedium, 0, 100]
    } else {
        arrayColores = [0.15, 0, colorMedium, 0, 0.95]
    }
    arrayColores[1] = colorMedium - (colorMedium - arrayColores[0]) / 2;
    arrayColores[3] = (arrayColores[4] - colorMedium) / 2 + colorMedium;
    color = [chroma(colorPrincipal).set('hsl.l', arrayColores[0]).hex(), chroma(colorPrincipal).set('hsl.l', arrayColores[1]).hex(), chroma(colorPrincipal).hex(), chroma(colorPrincipal).set('hsl.l', arrayColores[3]).hex(), chroma(colorPrincipal).set('hsl.l', arrayColores[4]).hex()]

    if (resultadoCortes.length == 1) {
        color = [color[2]];
    }
    if (resultadoCortes.length == 2) {
        color = [color[2], color[3]]
    }
    if (resultadoCortes.length == 3) {
        color = [color[0], color[2], color[color.length - 1]]
    }

    var totalesScale = d3.scale.linear().domain([0, 4]).range([min, max]);
    var totales = [min, totalesScale(1), totalesScale(2), totalesScale(3), max];


    var titulo = "Cantidad de " + getUnidades(varVariable);
    if (getTipoDiv() == "VA") {
        titulo = "Índice";
    }
    var lengthTitulo = titulo.length;
    var width = 180 //(lengthTitulo * 5) + 40
    var height = 160

    var radios = d3.scale.linear().domain([0, 4]).range([10, 60]);


    d3.select(".map__legend__symbol svg").remove();
    var cir = d3.select(".map__legend__symbol")
        .append("svg")
        .attr("width", width + 20)
        .attr("height", height + 20)
        .append("g")
        .attr("transform", "translate(" + 10 + "," + 10 + ")");

    cir.append("text")
        .attr("x", width / 2)
        .attr("y", 15)
        .attr("font-size", '0.9em')
        .attr("font-weight", '400')
        .attr("color", '#3D3D3D')
        .attr("class", "map__legend__title_2")
        .attr('text-anchor', 'middle')
        .text(function () {
            return titulo;
        });

    for (var i = totales.length - 1; i >= 0; i--) {
        cir.append("line")
            .attr("x1", width / 2 - (radios(4) / 2))
            .attr("y1", function (d) {
                return height - radios(i) * 2;
            })
            .attr("x2", width / 2 + radios(4) - 25)
            .attr("y2", function (d) {
                return height - radios(i) * 2;
            })
            .attr("stroke-width", "1px")
            .attr("stroke", "#6B6866");

        cir.append("circle")
            .attr("cx", width / 2 - (radios(4) / 2))
            .attr("cy", function (d) {
                return height - radios(i);
            })
            .attr("r", function (d) {
                return radios(i);
            })
            .attr("stroke-width", 1)
            .attr("stroke", "#000000")
            .attr("fill-opacity", 0)
            .attr("fill", "#000000");

        cir.append("text")
            .attr("x", width / 2 + radios(4) - 25)
            .attr("y", function (d) {
                return height + 3 - radios(i) * 2;
            })
            .attr('fill', '#3D3D3D')
            .attr('font-size', '0.8em')
            .attr('font-weight', '400')
            .attr('text-anchor', 'start')
            .text(function (d) {
                return Math.round(totales[i]).toLocaleString('de-DE');
            });
    }
}

function loadCirculos(data) {
    var arrayDatos = []
    for (var i = 0; i < data.features.length; i++) {
        if ($("#FiltroGeograficoLvl1").val() == "-1") {
            arrayDatos.push(parseFloat(getValorPorcentaje(data.features[i].properties.VARIABLE, data.features[i].properties.DPTO_CCDGO)))
        }
        else {
            arrayDatos.push(parseFloat(getValorPorcentaje(data.features[i].properties.VARIABLE, data.features[i].properties.MPIO_CCNCT)))
        }
    }
    //c(arrayDatos)
    var max = d3.max(arrayDatos)
    var min = d3.min(arrayDatos)

    var metersPerPx = 156543.03392 * Math.cos($var.Map.map.getCenter().lat() * Math.PI / 180) / Math.pow(2, $var.Map.map.getZoom())

    var radius = d3.scale.linear().domain([min, max]).range([5 * metersPerPx, 30 * metersPerPx]);

    var tipoDiv;
    tipoDiv = getTipoDiv();

    for (var i = 0; i < data.features.length; i++) {
        if (filtroArea == "2") {
            var centro = new google.maps.LatLng(data.features[i].properties.Centro_Y, data.features[i].properties.Centro_X)
            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                var radio = radius(parseFloat(getValorPorcentaje(data.features[i].properties.VARIABLE, data.features[i].properties.DPTO_CCDGO)))
                var codigo = data.features[i].properties.DPTO_CCDGO;
                var codigo2 = null;
                var nombre = data.features[i].properties.DPTO_CNMBR;
                var nombre2 = null;
            }
            else {
                var radio = radius(parseFloat(getValorPorcentaje(data.features[i].properties.VARIABLE, data.features[i].properties.MPIO_CCNCT)))
                var codigo = data.features[i].properties.DPTO_CCDGO;
                var codigo2 = data.features[i].properties.MPIO_CCNCT;
                var nombre = data.features[i].properties.DPTO_CNMBR;
                var nombre2 = data.features[i].properties.MPIO_CNMBR;
            }
        }
        else {
            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                var centro = new google.maps.LatLng(data.features[i].properties.CENTRO_Y_C, data.features[i].properties.CENTRO_X_C)
                var radio = radius(parseFloat(getValorPorcentaje(data.features[i].properties.VARIABLE, data.features[i].properties.DPTO_CCDGO)))
                var codigo = data.features[i].properties.DPTO_CCDGO;
                var codigo2 = null;
                var nombre = data.features[i].properties.DPTO_CNMBR;
                var nombre2 = null;
            }
            else {
                var centro = new google.maps.LatLng(data.features[i].properties.CENTRO_Y_C, data.features[i].properties.CENTRO_X_C)
                var radio = radius(parseFloat(getValorPorcentaje(data.features[i].properties.VARIABLE, data.features[i].properties.MPIO_CCNCT)))
                var codigo = data.features[i].properties.DPTO_CCDGO;
                var codigo2 = data.features[i].properties.MPIO_CCNCT;
                var nombre = data.features[i].properties.DPTO_CNMBR;
                var nombre2 = data.features[i].properties.MPIO_CNMBR;
            }

        }
        var circulo = new google.maps.Circle({
            strokeColor: colorFill(data.features[i].properties.VARIABLE),
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: colorFill(data.features[i].properties.VARIABLE),
            fillOpacity: percentageMapOpacity,
            clickable: $var.Map.clickableLayer,
            radius: radio,
            //radius: radius(data.features[i].properties.VARIABLE),
            center: centro,
            zIndex: 100,
            "codigo": codigo,
            "codigo2": codigo2,
            "nombre": nombre,
            "nombre2": nombre2,
            "variable": data.features[i].properties.VARIABLE
        });
        circulo.setMap($var.Map.map);
        google.maps.event.clearListeners(circulo, 'mouseover');
        google.maps.event.addListener(circulo, 'mouseover', function (event) {
            if ($var.Map.clickableLayer) {
                d3.select(".tooltip").remove();
                div = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip");

                if (this.variable != null) {
                    if ($("#FiltroGeograficoLvl1").val() == "-1") {
                        if (tipoDiv == "VA") {
                            var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Departamento:</strong> " + this.codigo + " - " + this.nombre + "</p>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + (getNumber(this.variable)).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + "</p>";
                        }
                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                            var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Departamento:</strong> " + this.codigo + " - " + this.nombre + "</p>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + parseFloat(parseFloat(getNumber(this.variable)).toFixed(1)).toLocaleString("de-DE") + "% (" + getValorPorcentaje(getNumber(this.variable), this.codigo).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + ") <br>" + "</p>";
                        }

                    }
                    else {
                        if (tipoDiv == "VA") {
                            var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Departamento:</strong> " + this.codigo + " - " + this.nombre + "</p>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Municipio:</strong> " + this.codigo2 + " - " + this.nombre2 + "</p>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + (getNumber(this.variable)).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + ")<br>" + "</p>";
                        }
                        else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                            var contentString = "<h4 class='locationPopUp__title'>Información</h4>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Departamento:</strong> " + this.codigo + " - " + this.nombre + "</p>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>Municipio:</strong> " + this.codigo2 + " - " + this.nombre2 + "</p>"
                                + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + parseFloat(parseFloat(getNumber(this.variable)).toFixed(1)).toLocaleString("de-DE") + "% (" + getValorPorcentaje(getNumber(this.variable), this.codigo2).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + ")<br>" + "</p>";
                        }
                    }


                    div.selectAll("text").remove();
                    div.append("text")
                        .html(contentString);
                    div.style("left", (event.domEvent.clientX - $(".tooltip").width() / 2) + "px")
                        .style("top", (event.domEvent.clientY + 120) + "px");
                }
            }
        });

        google.maps.event.clearListeners(circulo, 'mousemove');
        google.maps.event.addListener(circulo, 'mousemove', function (event) {
            $var.Map.screenCoord =
                'Latitud: ' + $var.Map.sixDecimal(event.latLng.lat()) +
                ' Longitud: ' + $var.Map.sixDecimal(event.latLng.lng());
            $('.map__coord__value').html('');
            $('.map__coord__value').append($var.Map.screenCoord);
        });

        google.maps.event.clearListeners(circulo, 'mouseout');
        google.maps.event.addListener(circulo, 'mouseout', function (event) {
            if ($var.Map.clickableLayer) {
                div.remove();
            }
        });
        arrayCirculos.push(circulo)
    }
}

function removeCapas() {
    $var.Map.layers.layerDatos.forEach(function (feature) {
        $var.Map.layers.layerDatos.remove(feature);
    });
}

function loadCortes(array) {
    $("#functionPalette__numberMethod option").attr("disabled", false)
    if (array.length <= numberClass) {
        if (array.length == 1) {
            $("#functionPalette__numberMethod").val(array.length)
        }
        else {
            $("#functionPalette__numberMethod").val(array.length - 1)
        }
    }
    for (var a = array.length; a < 10; a++) {
        $("#functionPalette__numberMethod [value=" + a + "]").attr("disabled", true)
    }
    cortesNuevo = new geostats(array)
    if (typeDivision == 0) {
        resultadoCortes = cortesNuevo.getClassQuantile(numberClass);
    } else if (typeDivision == 1) {
        resultadoCortes = cortesNuevo.getClassJenks(numberClass);
    } else {
        resultadoCortes = cortesNuevo.getClassEqInterval(numberClass);
    }
    resultadoCortes = resultadoCortes.unique();


    for (var a = 0; a < resultadoCortes.length; a++) {
        if (resultadoCortes[a] == undefined) {
            resultadoCortes.splice(a, 1)
        }
    }

    if (resultadoCortes.length == 1) {
        max = d3.max(resultadoCortes);
        nombresLeyenda[0] = parseFloat(resultadoCortes[0].toFixed(1)).toLocaleString('de-DE');
    } else if (resultadoCortes.length == 2) {
        max = d3.max(resultadoCortes);
        nombresLeyenda[0] = parseFloat(resultadoCortes[0].toFixed(1)).toLocaleString('de-DE') + " - " + parseFloat(resultadoCortes[1].toFixed(1)).toLocaleString('de-DE');
    } else {
        max = d3.max(resultadoCortes);
        for (var a = resultadoCortes.length - 1; a > 0; a--) {
            nombresLeyenda.push(parseFloat(resultadoCortes[a - 1].toFixed(1)).toLocaleString('de-DE') + " - " + parseFloat(resultadoCortes[a].toFixed(1)).toLocaleString('de-DE'));
        }
    }
}

function getSymbol(value) {
    if (value == null) {
        return [
            {
                'polygonFill': "white",
                'polygonOpacity': 0,
                'lineColor': 'white',
                'lineWidth': 1
            }
        ]
    } else {
        return [
            {
                'polygonFill': colorFill(value),
                'polygonOpacity': 0.6,
                'lineColor': 'white',
                'lineWidth': 1
            }
        ]
    }
}
// */

//* Fn handleDataStyle
function handleDataStyle(event) {
    if (filtroArea == "1" || filtroArea == "2") {
        return ({
            fillColor: 'white',
            fillOpacity: 0,
            strokeOpacity: 0,
            strokeColor: '#828282',
            strokeWeight: 1,
            clickable: false,
            zIndex: 2
        });
    } else {
        if (($("#FiltroGeograficoLvl2").val() != "-1" && $("#FiltroGeograficoLvl2").val() != null)) {
            return ({
                fillColor: colorFill(event.getProperty("VARIABLE")),
                fillOpacity: 0,
                strokeOpacity: percentageMapOpacity,
                strokeColor: 'white',
                strokeWeight: 0,
                clickable: false,
                zIndex: 1
            });
        } else if (event.getProperty("VARIABLE") == null) {
            return ({
                fillColor: 'white',
                fillOpacity: 0,
                strokeColor: 'white',
                strokeWeight: 1,
                clickable: $var.Map.clickableLayer,
                zIndex: 1
            });
        } else {
            return ({
                fillColor: colorFill(event.getProperty("VARIABLE")),
                fillOpacity: percentageMapOpacity,
                strokeOpacity: percentageMapOpacity,
                strokeColor: 'white',
                strokeWeight: 1,
                clickable: $var.Map.clickableLayer,
                zIndex: 1
            });
        }
    }
}
// */

//* Función - Obtiene el color del arreglo
function getColorArray() {
    var color = ["#1D3A6C", "#2D68AC", "#00699F", "#0088BC", "#44A8E0", "#4599C2", "#70B5D8", "#7AB2E1", "#9CCAED", "#B6D8F0"];
    var colorPrincipal;
    for (var i = 0; i < listaColores.length; i++) {
        if (listaColores[i][0] == $var.Map.varVariable) {
            colorPrincipal = listaColores[i][1].split(",");
        }
    }
    var colorMedium = chroma(colorPrincipal).get('hsl.l');
    var arrayColores = []
    var scaleUp = d3.scale.linear();
    var scaleDown = d3.scale.linear();

    // c(colorMedium)
    if (colorMedium > 1) {
        scaleDown.domain([0, 4]).range([1, colorMedium]);
        scaleUp.domain([0, 4]).range([colorMedium, 100]);
        arrayColores = [1, 0, 0, 0, colorMedium, 0, 0, 0, 100]
    } else {
        scaleDown.domain([0, 4]).range([0.15, colorMedium]);
        scaleUp.domain([0, 4]).range([colorMedium, 0.90]);
    }
    arrayColores = [scaleDown(0), scaleDown(1), scaleDown(2), scaleDown(3), colorMedium, scaleUp(1), scaleUp(2), scaleUp(3), scaleUp(4)];

    // c(arrayColores)
    color = [chroma(colorPrincipal).set('hsl.l', arrayColores[0]).hex(), chroma(colorPrincipal).set('hsl.l', arrayColores[1]).hex(), chroma(colorPrincipal).set('hsl.l', arrayColores[2]).hex(), chroma(colorPrincipal).set('hsl.l', arrayColores[3]).hex(), chroma(colorPrincipal).hex(), chroma(colorPrincipal).set('hsl.l', arrayColores[5]).hex(), chroma(colorPrincipal).set('hsl.l', arrayColores[6]).hex(), chroma(colorPrincipal).set('hsl.l', arrayColores[7]).hex(), chroma(colorPrincipal).set('hsl.l', arrayColores[8]).hex()];

    // c(color)
    return color;
}

function colorFill(value) {
    if (value == null || value == 0) {
        return "#CECBCF";
    }
    var color = getColorArray();

    if (colorClass != "") {
        color = colorClass;
    }

    if (resultadoCortes.length == 1) {
        return color[4];
    }
    if (resultadoCortes.length == 2) {
        if (value >= resultadoCortes[0] && value <= resultadoCortes[1]) {
            return color[4];
        }
    }
    if (resultadoCortes.length == 3) {
        if (value >= resultadoCortes[1] && value <= resultadoCortes[2]) {
            return color[4];
        }
        if (value < resultadoCortes[1]) {
            return color[5];
        }
    }
    if (resultadoCortes.length == 4) {
        if (value >= resultadoCortes[2] && value <= resultadoCortes[3]) {
            return color[2];
        }
        if (value >= resultadoCortes[1] && value < resultadoCortes[2]) {
            return color[4];
        }
        if (value < resultadoCortes[1]) {
            return color[6];
        }
    }
    if (resultadoCortes.length == 5) {
        if (value >= resultadoCortes[3] && value <= resultadoCortes[4]) {
            return color[2];
        }
        if (value >= resultadoCortes[2] && value < resultadoCortes[3]) {
            return color[4];
        }
        if (value >= resultadoCortes[1] && value < resultadoCortes[2]) {
            return color[6];
        }
        if (value < resultadoCortes[1]) {
            return color[8];
        }
    }
    if (resultadoCortes.length == 6) {
        if (value >= resultadoCortes[4] && value <= resultadoCortes[5]) {
            return color[0];
        }
        if (value >= resultadoCortes[3] && value < resultadoCortes[4]) {
            return color[2];
        }
        if (value >= resultadoCortes[2] && value < resultadoCortes[3]) {
            return color[4];
        }
        if (value >= resultadoCortes[1] && value < resultadoCortes[2]) {
            return color[6];
        }
        if (value < resultadoCortes[1]) {
            return color[8];
        }
    }
    if (resultadoCortes.length == 7) {
        if (value >= resultadoCortes[5] && value <= resultadoCortes[6]) {
            return color[0];
        }
        if (value >= resultadoCortes[4] && value <= resultadoCortes[5]) {
            return color[2];
        }
        if (value >= resultadoCortes[3] && value < resultadoCortes[4]) {
            return color[4];
        }
        if (value >= resultadoCortes[2] && value < resultadoCortes[3]) {
            return color[5];
        }
        if (value >= resultadoCortes[1] && value < resultadoCortes[2]) {
            return color[6];
        }
        if (value < resultadoCortes[1]) {
            return color[8];
        }
    }
    if (resultadoCortes.length == 8) {
        if (value >= resultadoCortes[6] && value <= resultadoCortes[7]) {
            return color[0];
        }
        if (value >= resultadoCortes[5] && value <= resultadoCortes[6]) {
            return color[2];
        }
        if (value >= resultadoCortes[4] && value <= resultadoCortes[5]) {
            return color[3];
        }
        if (value >= resultadoCortes[3] && value < resultadoCortes[4]) {
            return color[4];
        }
        if (value >= resultadoCortes[2] && value < resultadoCortes[3]) {
            return color[5];
        }
        if (value >= resultadoCortes[1] && value < resultadoCortes[2]) {
            return color[6];
        }
        if (value < resultadoCortes[1]) {
            return color[8];
        }
    }
    if (resultadoCortes.length == 9) {
        if (value >= resultadoCortes[7] && value <= resultadoCortes[8]) {
            return color[0];
        }
        if (value >= resultadoCortes[6] && value <= resultadoCortes[7]) {
            return color[1];
        }
        if (value >= resultadoCortes[5] && value <= resultadoCortes[6]) {
            return color[2];
        }
        if (value >= resultadoCortes[4] && value <= resultadoCortes[5]) {
            return color[3];
        }
        if (value >= resultadoCortes[3] && value < resultadoCortes[4]) {
            return color[4];
        }
        if (value >= resultadoCortes[2] && value < resultadoCortes[3]) {
            return color[5];
        }
        if (value >= resultadoCortes[1] && value < resultadoCortes[2]) {
            return color[6];
        }
        if (value < resultadoCortes[1]) {
            return color[8];
        }
    }
    if (resultadoCortes.length == 10) {
        if (value >= resultadoCortes[8] && value <= resultadoCortes[9]) {
            return color[0];
        }
        if (value >= resultadoCortes[7] && value <= resultadoCortes[8]) {
            return color[1];
        }
        if (value >= resultadoCortes[6] && value <= resultadoCortes[7]) {
            return color[2];
        }
        if (value >= resultadoCortes[5] && value <= resultadoCortes[6]) {
            return color[3];
        }
        if (value >= resultadoCortes[4] && value <= resultadoCortes[5]) {
            return color[4];
        }
        if (value >= resultadoCortes[3] && value < resultadoCortes[4]) {
            return color[5];
        }
        if (value >= resultadoCortes[2] && value < resultadoCortes[3]) {
            return color[6];
        }
        if (value >= resultadoCortes[1] && value < resultadoCortes[2]) {
            return color[7];
        }
        if (value < resultadoCortes[1]) {
            return color[8];
        }
    }
    return "#CECBCF";
}

function getNombreVariable() {
    for (var i = 0; i < listaVariables.length; i++) {
        if (listaVariables[i][0] == $var.Map.varVariable) {
            return $("#results__panel__title__themeName").text()
        }
    }
}

function getTieneClase() {
    for (var i = 0; i < listaClaseTiene.length; i++) {
        if (listaClaseTiene[i][0] == $var.Map.varVariable) {
            return listaClaseTiene[i][1];
        }
    }
}

function getTieneAnio() {
    for (var i = 0; i < listaAnioTiene.length; i++) {
        if (listaAnioTiene[i][0] == $var.Map.varVariable) {
            return listaAnioTiene[i][1];
        }
    }
}

function getTieneSexo() {
    for (var i = 0; i < listaSexo.length; i++) {
        if (listaSexo[i][0] == $var.Map.varVariable) {
            return listaSexo[i][1];
        }
    }
}

function getNivelesFiltro() {
    for (var i = 0; i < listaNivelesFiltro.length; i++) {
        if (listaNivelesFiltro[i][0] == $var.Map.varVariable) {
            return listaNivelesFiltro[i][1];
        }
    }
}

function getValorPorcentaje(value, codigo) {
    var variablesArreglo = [];

    for (var i = 0; i < listaVariables.length; i++) {
        if (listaVariables[i][0].substring(0, 5) == varSubtema) {
            variablesArreglo.push(listaVariables[i][1]);
        }
    }
    var tipoDiv = getTipoDiv();
    var sumValores = 0;
    if (tipoDiv == "VAC" || tipoDiv == "S" || (tipoDiv == "C" && variablesArreglo.length == 1)) {
        sumValores = arrayTotales[arrayTotales.length - 1][1];
    } else {
        for (var i = 0; i < arrayTotales.length; i++) {
            if (arrayTotales[i][0] == codigo) {
                sumValores = arrayTotales[i][1];
            }
        }
    }
    if (tipoDiv == "VA") {
        return Math.round(value); //.toLocaleString("de-De")
    } else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
        return Math.round(value * sumValores / 100); //.toLocaleString("de-De")
    }

}

function getVariableTotal() {
    for (var i = 0; i < listaTotal.length; i++) {
        if (listaTotal[i][0] == $var.Map.varVariable) {
            return listaTotal[i][1];
        }
    }
}

function getTieneCompuesto() {
    for (var i = 0; i < listaCompuestoTiene.length; i++) {
        if (listaCompuestoTiene[i][0] == $var.Map.varVariable) {
            return listaCompuestoTiene[i][1];
        }
    }
}

function getUnidades() {
    for (var a = 0; a < listaUnidades.length; a++) {
        if ($var.Map.varVariable == listaUnidades[a][0]) {
            return listaUnidades[a][1]
        }
    }
}

function getDepartamento(value) {
    for (var a = 0; a < listaDivipolaDeptos.length; a++) {
        if (value == listaDivipolaDeptos[a][0]) {
            return listaDivipolaDeptos[a][1]
        }
    }
}

function getMpio(value) {
    for (var a = 0; a < listaDivipolaMpios.length; a++) {
        if (value.length == 3) {
            if ($("#FiltroGeograficoLvl1").val() + value == listaDivipolaMpios[a][0]) {
                return listaDivipolaMpios[a][1]
            }
        }
        else {
            if (value == listaDivipolaMpios[a][0]) {
                return listaDivipolaMpios[a][1]
            }
        }
    }
}

function getClase() {
    if (filtroArea == 0) {
        return "0";
    } else if (filtroArea == 1) {
        return "1";
    } else if (filtroArea == 2) {
        return "2";
    } else if (filtroArea == 3) {
        return "3";
    }
}
function getTipoTematica(value) {
    if (value == 0) {
        return "Temas Generales";
    }
    if (value == 3) {
        return "Agricultura, ganadería, caza, silvicultura y pesca";
    } else if (value == 4) {
        return "Explotación de minas y canteras";
    } else if (value == 5) {
        return "Industrias manufactureras";
    } else if (value == 6) {
        return "Suministro de electricidad, gas, vapor y aire acondicionado";
    } else if (value == 7) {
        return "Distribución de agua; evacuación y tratamiento de aguas residuales, gestión de desechos y actividades  de saneamiento ambiental";
    } else if (value == 8) {
        return "Construcción";
    } else if (value == 9) {
        return "Comercio al por mayor y al por menor; reparación de vehículos automotores y motocicletas";
    } else if (value == 10) {
        return "Transporte y almacenamiento";
    } else if (value == 11) {
        return "Alojamiento y servicios de comida";
    } else if (value == 12) {
        return "Información y comunicaciones";
    } else if (value == 13) {

        return "Actividades financieras y de seguros";
    } else if (value == 14) {
        return "Actividades inmobiliarias";
    } else if (value == 15) {
        return "Actividades profesionales, científicas y técnicas";
    } else if (value == 16) {
        return "Actividades de servicios administrativos y de apoyo";
    } else if (value == 17) {
        return "Administración pública y defensa; planes de seguridad social de afiliación obligatoria";
    } else if (value == 18) {
        return "Educación";
    } else if (value == 19) {
        return "Actividades de atención de la salud humana y de asistencia social";
    } else if (value == 20) {
        return "Actividades artísticas, de entretenimiento y recreación";
    } else if (value == 21) {
        return "Otras actividades de servicios";
    } else if (value == 22) {
        return "Actividades de los hogares en calidad de empleadores; actividades no diferenciadas de los hogares  individuales como productores de bienes y servicios para uso propio";
    } else if (value == 23) {
        return "Actividades de organizaciones y entidades extraterritoriales";
    }
}

function getTipoDiv() {
    for (var i = 0; i < listaTipo.length; i++) {
        if (listaTipo[i][0] == $var.Map.varVariable) {
            return listaTipo[i][1];
        }
    }
}

function getNombreClase(value) {
    if (value == "0") {
        return "Total";
    } else if (value == "1") {
        return "Cabecera municipal";
    } else if (value == "2") {
        return "Centros poblados";
    } else if (value == "3") {
        return "Rural disperso";
    } else if (value == "4") {
        return "Resto rural";
    } else {
        return "Sin información";
    }
}

function convertToCSV(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    var CSV = '';
    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";

        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            //Now convert each value to string and comma-seprated
            row += RemoveAccents((index)) + ',';
        }
        row = row.slice(0, -1);
        //append Label row with line break
        CSV += row + '\r\n';
    }

    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + RemoveAccents(arrData[i][index]) + '",';
        }
        row.slice(0, row.length - 1);
        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {
        alert("Invalid data");
        return;
    }

    //this trick will generate a temp "a" tag
    var link = document.createElement("a");
    link.id = "lnkDwnldLnk";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);

    var csv = CSV;
    blob = new Blob([csv], { encoding: "UTF-8", type: 'text/csv;charset=UTF-8' });
    //var csvUrl = window.webkitURL.createObjectURL(blob);
    var csvUrl = window.URL.createObjectURL(blob);
    var filename = ReportTitle + '.csv';
    $("#lnkDwnldLnk")
        .attr({
            'download': filename,
            'href': csvUrl
        });

    $('#lnkDwnldLnk')[0].click();
    document.body.removeChild(link);
}

function getAncho(ancho) {
    var anc = ancho * 8;
    if (anc < 100) {
        return anc + "px";
    } else {
        return "100px";
    }
}

function getAnchoOffset(ancho) {
    var anc = ancho * 4;
    if (anc < 50) {
        return -1 * anc;
    } else {
        return -50;
    }
}

function isNull(value) {
    if (value == "" || value == null || value == " " || value == "                    ") {
        return 0;
    } else if (value) {
        return value;
    }
    return 0;
}

function cargarMapaCalor() {
    $(".map__legend img").remove();
    d3.select(".map__legend__symbol svg").remove();
    coordY1 = $var.Map.map.getBounds().getSouthWest().lng();
    coordX1 = $var.Map.map.getBounds().getSouthWest().lat();
    coordY2 = $var.Map.map.getBounds().getNorthEast().lng();
    coordX2 = $var.Map.map.getBounds().getNorthEast().lat();
    $(".loader").addClass('--active');
    $.ajax({
        type: "GET",
        url: "https://geoportal.dane.gov.co/laboratorio/serviciosjson/densidad/puntos.php?anio=2018&x1=" + coordX1 + "&y1=" + coordY1 + "&x2=" + coordX2 + "&y2=" + coordY2 + "&zoom=2",
        dataType: "json",
        success: function (data) {
            if (heatmap != null) {
                heatmap.setMap(null)
            }
            var quakePoints18 = [];
            var array = [];
            var maxPoint;
            for (var i = 0; i < data.resultado.length; i++) {
                var obj = {
                    "location": new google.maps.LatLng(parseFloat(isNull(data.resultado[i]["LATITUD"])), parseFloat(isNull(data.resultado[i]["LONGITUD"]))),
                    "weight": parseFloat(isNull(data.resultado[i]["VIVIENDAS"]))
                };
                array.push(parseFloat(isNull(data.resultado[i]["VIVIENDAS"])))
                quakePoints18.push(obj);
            }
            pointArray = new google.maps.MVCArray(quakePoints18);
            maxPoint = d3.max(array)
            // c(maxPoint)
            var gradient = [
                'rgba(0, 27, 249, 0)',
                'rgba(0, 27, 249, 1)',
                'rgba(31, 47, 153, 1)',
                'rgba(72, 156, 174, 1)',
                'rgba(59, 214, 183, 1)',
                'rgba(100, 247, 92, 1)',
                'rgba(140, 249, 83, 1)',
                'rgba(199, 253, 59, 1)',
                'rgba(255, 234, 28, 1)',
                'rgba(255, 109, 62, 1)',
                'rgba(255, 64, 64, 1)'
            ]

            heatmap = new google.maps.visualization.HeatmapLayer({
                data: pointArray,
                maxIntensity: heatIntensity,
                map: $var.Map.map
            });

            $('<img src="./src/images/leyenda.png"></img>').appendTo($(".map__legend"));
            $(".loader").removeClass('--active');
        }
    });

}

function realizarEstadisticas() {
    d3.select(".map__legend__symbol svg").remove();
    $(".loader").addClass('--active');
    if (metodo == 0) {
        posicionAnalisisX = $var.Map.circuloAnalisis.getCenter().lng();
        posicionAnalisisY = $var.Map.circuloAnalisis.getCenter().lat();
        radioSlider = $var.Map.radius;
        calcularEstadisticas(posicionAnalisisX, posicionAnalisisY, radioSlider);
    } else {
        if ($var.Map.isClosed) {
            var arrayPoly = $var.Map.poly.getPath().getArray();
            var stringCoor = "";
            for (var i = 0; i < arrayPoly.length; i++) {
                stringCoor += arrayPoly[i].lng() + "," + arrayPoly[i].lat();
                stringCoor += ",";
            }
            stringCoor = stringCoor.slice(0, stringCoor.length - 1);
            $.ajax({
                type: "GET",
                url: "https://geoportal.dane.gov.co/laboratorio/serviciosjson/variableAltura/indicadordatospoligonos.php?coordendas=" + stringCoor,
                crossDomain: true,
                dataType: "json",
                success: function (data) {
                    if (data[0].TOTAL_PERSONAS != null && data[0].TOTAL_PERSONAS != 0) {
                        datosDownload = data;
                        $(".loader").removeClass('--active');
                        graphUrbano(data);
                    }
                    else {
                        $(".loader").removeClass('--active');
                        graphUrbano(data);
                    }
                }
            });
        }
        else {
            cerrarPoly();
            var arrayPoly = $var.Map.poly.getPath().getArray();
            var stringCoor = "";
            for (var i = 0; i < arrayPoly.length; i++) {
                stringCoor += arrayPoly[i].lng() + "," + arrayPoly[i].lat();
                stringCoor += ",";
            }
            stringCoor = stringCoor.slice(0, stringCoor.length - 1); $.ajax({
                type: "GET",
                url: "https://geoportal.dane.gov.co/laboratorio/serviciosjson/variableAltura/indicadordatospoligonos.php?coordendas=" + stringCoor,
                crossDomain: true,
                dataType: "json",
                success: function (data) {
                    if (data[0].TOTAL_PERSONAS != null && data[0].TOTAL_PERSONAS != 0) {
                        datosDownload = data;
                        $(".loader").removeClass('--active');
                        graphUrbano(data);
                    }
                    else {
                        $(".loader").removeClass('--active');
                        graphUrbano(data);
                    }
                }
            });
        }
    }
}

function calcularEstadisticas(posicionAnalisisX, posicionAnalisisY, radioSlider) {
    coordX = posicionAnalisisX;
    coordY = posicionAnalisisY;
    longitud = radioSlider;
    text_estimacion_prox = 0;
    $.ajax({
        type: "GET",
        url: "https://geoportal.dane.gov.co/laboratorio/serviciosjson/variableAltura/indicadordatosgeoespacial.php?coordx=" + coordX + "&coordy=" + coordY + "&longitud=" + longitud,
        dataType: "json",
        success: function (data) {
            datosDownload = data;
            $(".loader").removeClass('--active');
            graphUrbano(data);
            loadTabla(data, 1)
        }
    });
}

function graphUrbano(result) {
    $("#resultGraph").remove();
    $("#frequencyGraph").remove();
    $(".results__panel__title").hide();
    $(".results__panel__selectGraph").hide();

    var start_val = 0;
    var end_val = [result[0]["TOTAL_PERSONAS"], result[0]["TOTAL_PERSONAS_HOGAR"], result[0]["TOTAL_PERSONAS_LEA"], result[0]["TOTAL_DE_HOGARES"], result[0]["TOTAL_DE_VIVIENDAS"]];
    var names_img = ["personas", "personashogar", "personaslea", "hogares", "viviendas"];
    var names_text = ["Personas (*)", "Total de personas en hogar", "Total de personas en LEA", "Hogares", "Viviendas"];

    //console.log($(".results__panel__graphs").width());
    var widthBox = $(".results__panel__graphs").width() - 20; //320

    var width = widthBox - 20;
    var height = 210;
    var margin = { top: 30, right: 10, bottom: 10, left: 10 };

    d3.select(".loadOne").remove();
    var svg = d3.select(".results__panel__graphs")
        .append("svg")
        .attr("class", "loadOne")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr('fill', "gray")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    if ((result[0]["TOTAL_PERSONAS"] == null || result[0]["TOTAL_PERSONAS"] == 0) && (result[0]["TOTAL_PERSONAS_HOGAR"] == null || result[0]["TOTAL_PERSONAS_HOGAR"] == 0) && (result[0]["TOTAL_PERSONAS_LEA"] == null || result[0]["TOTAL_PERSONAS_LEA"] == 0) && (result[0]["TOTAL_DE_HOGARES"] == null || result[0]["TOTAL_DE_HOGARES"] == 0) && (result[0]["TOTAL_DE_VIVIENDAS"] == null || result[0]["TOTAL_DE_VIVIENDAS"] == 0)) {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2)
            .attr("fill", "#3D3D3D")
            .attr('font-size', '0.8em')
            .attr('font-weight', '500')
            .attr("text-anchor", "middle")
            .attr('font-family', 'Roboto')
            .text("Viviendas, Hogares y Personas - Cantidad");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr('font-size', '28px')
            .attr("text-anchor", "middle")
            .text("No hay información");

        d3.select(".loadTwo").remove();
        d3.select(".loadThree").remove();
        d3.select(".loadFour").remove();
    } else {
        svg.selectAll(".rect")
            .data(end_val)
            .enter()
            .append("rect")
            .attr("class", "rect")
            .attr("height", 30)
            .attr("width", 250)
            .attr("x", function (d, i) {
                return 10;
            })
            .attr("y", function (d, i) {
                return 10 + i * (40);
            })
            .attr('fill', "white");

        svg.selectAll(".txt")
            .data(end_val)
            .enter()
            .append("text")
            .text(start_val)
            .attr("class", "txt")
            .attr("x", function (d, i) {
                return 85
            })
            .attr("y", function (d, i) {
                return 35 + i * (40);
            })
            .attr("text-anchor", "end")
            .attr('font-size', '22px')
            .transition()
            .duration(750)
            .tween("text", function (d) {
                var that = d3.select(this);
                var i = d3.interpolateString(that.text(), d);
                var prec = (d + "").split(".")
                var round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;
                return function (t) { that.text((Math.round(i(t) * round) / round).toLocaleString('de-DE')); };
            });

        svg.selectAll(".txtName")
            .data(names_text)
            .enter()
            .append("text")
            .text(function (d, i) {
                return names_text[i];
            })
            .attr("class", "txtName")
            .attr("x", function (d, i) {
                return 125;
            })
            .attr("y", function (d, i) {
                return 32 + i * (40);
            })
            .attr("text-anchor", "start")
            .attr('font-size', '12px');

        svg.selectAll("image")
            .data(names_img)
            .enter()
            .append("svg:image")
            .attr("xlink:href", function (d, i) {
                return "./src/images/" + names_img[i] + ".png";
            })
            .attr("x", function (d, i) {
                return 90
            })
            .attr("y", function (d, i) {
                return 13 + i * (40);
            })
            .attr("width", "23")
            .attr("height", "23");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("fill", "#3D3D3D")
            .attr('font-size', '0.8em')
            .attr('font-weight', '700')
            .attr("text-anchor", "middle")
            .attr('font-family', 'Roboto')
            .text("Viviendas, Hogares y Personas - Cantidad");


        arrayDatos = [["Apartamento", parseInt(result[0]["VIVIENDAS_TIPO_APARTAMENTO"])], ["Tipo cuarto", parseInt(result[0]["VIVIENDAS_TIPO_CUARTO"])], ["Casa", parseInt(result[0]["VIVIENDAS_TIPO_CASA"])], ["Casa Indígena", parseInt(result[0]["VIVIENDAS_TIPO_CASA_INDIGENA"])], ["Otro", parseInt(result[0]["VIVIENDAS_OTRO_TIPO_VIENDA"])]];
        arrayNumber = [parseInt(result[0]["VIVIENDAS_TIPO_APARTAMENTO"]), parseInt(result[0]["VIVIENDAS_TIPO_CUARTO"]), parseInt(result[0]["VIVIENDAS_TIPO_CASA"]), parseInt(result[0]["VIVIENDAS_TIPO_CASA_INDIGENA"]), parseInt(result[0]["VIVIENDAS_OTRO_TIPO_VIENDA"])];
        var suma = parseInt(result[0]["VIVIENDAS_TIPO_APARTAMENTO"]) + parseInt(result[0]["VIVIENDAS_TIPO_CUARTO"]) + parseInt(result[0]["VIVIENDAS_TIPO_CASA"]) + parseInt(result[0]["VIVIENDAS_TIPO_CASA_INDIGENA"]) + parseInt(result[0]["VIVIENDAS_OTRO_TIPO_VIENDA"]);
        var names_text = ["Apartamento", "Cuarto", "Casa", "Casa Indígena", "Otro"];
        var height = 240;
        var margin = { top: 30, right: 10, bottom: 50, left: 10 };
        var width = widthBox - margin.left - margin.right;
        var max = d3.max(arrayNumber) + (d3.max(arrayNumber) * 0.1);
        var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
        var y = d3.scale.linear().domain([0, max]).range([height, 0]);
        var color = d3.scale.ordinal().domain([0, 4]).range(["#005499", "#717171", "#dd8800", "#20887c", "#00a1f2"]);

        var xAxis = d3.svg.axis()
            .orient("bottom")
            .scale(x)
            .tickFormat(function (d, i) {
                return names_text[i];
            });

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(y)
            .ticks(10)
            .tickFormat(function (d, i) {
                return d.toLocaleString('de-DE');
            });

        d3.select(".loadTwo").remove();
        var svg = d3.select(".results__panel__graphs")
            .append("svg")
            .attr("class", "loadTwo")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr('fill', "gray")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var defs = svg.append("defs");
        var filter = defs.append("filter")
            .attr("id", "dropshadow")
            .attr("height", "130%");
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 3);
        filter.append("feOffset")
            .attr("dx", 2)
            .attr("dy", 2)
            .attr("result", "offsetBlur");

        var feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode")
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");

        x.domain(arrayDatos.map(function (d) {
            return d[0];
        }));

        svg.append("g")
            .attr("class", "x axis")
            .style("font-size", "11px")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        var rects = svg.selectAll("rect")
            .data(arrayDatos)
            .enter()
            .append("rect")
            .attr("x", function (d, i) {
                return x(d[0]);
            })
            .attr("y", function (d) {
                return y(d[1]);
            })
            .attr("width", x.rangeBand())
            .attr("height", function (d) {
                return 0;
            })
            .attr('stroke-width', 1)
            .style("fill", function (d, i) {
                return color(i);
            })
            .style("cursor", "pointer");

        rects.transition()
            .duration(1000)
            .attr("y", function (d) {
                return y(d[1]);
            })
            .attr("height", function (d) {
                return height - y(d[1]);
            });

        svg.selectAll(".totalTipo")
            .data(arrayDatos)
            .enter()
            .append("text")
            .attr("class", "totalTipo")
            .attr("x", function (d, i) {
                return x(d[0]) + x.rangeBand() / 2;
            })
            .attr("y", function (d) {
                return y(d[1]) - 10;
            })
            .attr("text-anchor", "middle")
            .style('font-size', '16px')
            .style('display', 'block')
            .text(function (d, i) {
                return d[1].toLocaleString('de-DE');
            });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("fill", "#3D3D3D")
            .attr('font-size', '0.8em')
            .attr('font-weight', '700')
            .attr("text-anchor", "middle")
            .attr('font-family', 'Roboto')
            .text("Tipo de viviendas");

        svg.append("text")
            .attr("class", "")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", 5)
            .attr("text-anchor", "middle")
            .attr('font-size', '1em')
            .style('display', 'block')
            .text("Viviendas");

        svg.append("text")
            .attr("x", 0)
            .attr("y", height + margin.top + 10)
            .attr('font-size', '16px')
            .attr('font-weight', '400')
            .attr('font-style', 'italic')
            .attr("text-anchor", "start")
            .text("Total vivendas: " + suma.toLocaleString('de-DE'));

        arrayNumber = [parseInt(result[0]["TOTAL_HOMBRES"]), parseInt(result[0]["TOTAL_MUJERES"])];
        maxNumber = d3.max(arrayNumber);
        minNumber = d3.min(arrayNumber);
        var suma = parseInt(result[0]["TOTAL_HOMBRES"]) + parseInt(result[0]["TOTAL_MUJERES"]);
        var porcentajesNumber = [parseInt(result[0]["TOTAL_HOMBRES"]) / suma * 100, parseInt(result[0]["TOTAL_MUJERES"]) / suma * 100]
        var names_text = ["Hombres", "Mujeres"];
        var margin = { top: 30, right: 100, bottom: 50, left: 100 };
        var height = 120;
        var width = widthBox - margin.left - margin.right;
        widthMen = width / 4;
        widthWomen = width / 4;
        heightChart = height;

        d3.select(".loadThree").remove();
        var svg = d3.select(".results__panel__graphs")
            .append("svg")
            .attr("class", "loadThree")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr('fill', "gray")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var AxisY = d3.scale.linear()
            .domain([0, maxNumber])
            .range([50, heightChart]);

        svg.selectAll("svg")
            .data(arrayNumber)
            .enter()
            .append("svg")
            .attr("class", function (d, i) {
                if (i == 0) {
                    return "men";
                }
                if (i == 1) {
                    return "women";
                }
            })
            .attr("x", function (d, i) {
                if (i == 0) {
                    return (width / 2 - width / 8 - widthMen);
                }
                if (i == 1) {
                    return (width / 2 + width / 8);
                }
            })
            .attr("y", function (d, i) {
                return AxisY(maxNumber) / 2 - widthMen / 2;
            })
            .attr("width", function (d, i) {
                return width / 4;
            })
            .attr("height", function (d, i) {
                heightMen = AxisY(maxNumber);
                heightWomen = AxisY(maxNumber);
                return AxisY(maxNumber);
            });

        polyMen = [{ "x": widthMen * 0.700, "y": heightMen * 0.200 },
        { "x": widthMen * 0.900, "y": heightMen * 0.550 },
        { "x": widthMen * 0.800, "y": heightMen * 0.550 },
        { "x": widthMen * 0.700, "y": heightMen * 0.400 },
        { "x": widthMen * 0.650, "y": heightMen * 0.300 },
        { "x": widthMen * 0.650, "y": heightMen * 0.400 },
        { "x": widthMen * 0.650, "y": heightMen * 0.950 },
        { "x": widthMen * 0.640, "y": heightMen * 1 },
        { "x": widthMen * 0.560, "y": heightMen * 1 },
        { "x": widthMen * 0.530, "y": heightMen * 0.950 },
        { "x": widthMen * 0.520, "y": heightMen * 0.600 },
        //500
        { "x": widthMen * 0.480, "y": heightMen * 0.600 },
        { "x": widthMen * 0.470, "y": heightMen * 0.950 },
        { "x": widthMen * 0.440, "y": heightMen * 1 },
        { "x": widthMen * 0.360, "y": heightMen * 1 },
        { "x": widthMen * 0.350, "y": heightMen * 0.950 },
        { "x": widthMen * 0.350, "y": heightMen * 0.400 },
        { "x": widthMen * 0.350, "y": heightMen * 0.300 },
        { "x": widthMen * 0.300, "y": heightMen * 0.400 },
        { "x": widthMen * 0.200, "y": heightMen * 0.550 },
        { "x": widthMen * 0.100, "y": heightMen * 0.550 },
        { "x": widthMen * 0.300, "y": heightMen * 0.200 },
        ];

        svgContainerM = d3.select(".men")
            .append("svg")
            .attr("width", widthMen)//500
            .attr("height", heightMen);//1000

        svgContainerM.append("svg:image")
            .attr("xlink:href", function (d, i) {
                return "./src/images/hombre.png";
            })
            .attr("x", function (d, i) {
                return 0
            })
            .attr("y", function (d, i) {
                return 0;
            })
            .attr("width", widthMen)
            .attr("height", widthMen);

        // svgContainerM.append("circle")
        //     .attr("cx", widthMen * 0.500)//55
        //     .attr("cy", heightMen*0.100)//30
        //     .attr("r", heightMen*0.075)//20
        //     .attr("fill","#008086");

        // svgContainerM.selectAll("polygon")
        //     .data([polyMen])
        //     .enter()
        //     .append("polygon")
        //     .attr("points",function(d) { 
        //         return d.map(function(d) { return [d.x,d.y].join(","); }).join(" ");})
        //     .attr("fill","#008086");

        polyWomen = [{ "x": widthWomen * 0.700, "y": heightWomen * 0.200 },
        { "x": widthWomen * 0.900, "y": heightWomen * 0.500 },
        { "x": widthWomen * 0.800, "y": heightWomen * 0.500 },
        { "x": widthWomen * 0.700, "y": heightWomen * 0.400 },
        { "x": widthWomen * 0.650, "y": heightWomen * 0.300 },
        { "x": widthWomen * 0.630, "y": heightWomen * 0.400 },
        { "x": widthWomen * 0.850, "y": heightWomen * 0.650 },
        { "x": widthWomen * 0.680, "y": heightWomen * 0.650 },
        { "x": widthWomen * 0.650, "y": heightWomen * 0.900 },
        { "x": widthWomen * 0.640, "y": heightWomen * 1 },
        { "x": widthWomen * 0.540, "y": heightWomen * 1 },
        { "x": widthWomen * 0.530, "y": heightWomen * 0.950 },
        { "x": widthWomen * 0.530, "y": heightWomen * 0.650 },
        //500
        { "x": widthWomen * 0.470, "y": heightWomen * 0.650 },
        { "x": widthWomen * 0.470, "y": heightWomen * 0.950 },
        { "x": widthWomen * 0.460, "y": heightWomen * 1 },
        { "x": widthWomen * 0.360, "y": heightWomen * 1 },
        { "x": widthWomen * 0.350, "y": heightWomen * 0.900 },
        { "x": widthWomen * 0.320, "y": heightWomen * 0.650 },
        { "x": widthWomen * 0.150, "y": heightWomen * 0.650 },
        { "x": widthWomen * 0.370, "y": heightWomen * 0.400 },
        { "x": widthWomen * 0.350, "y": heightWomen * 0.300 },
        { "x": widthWomen * 0.300, "y": heightWomen * 0.400 },
        { "x": widthWomen * 0.200, "y": heightWomen * 0.500 },
        { "x": widthWomen * 0.100, "y": heightWomen * 0.500 },
        { "x": widthWomen * 0.300, "y": heightWomen * 0.200 },
        ];


        svgContainerW = d3.select(".women")
            .append("svg")
            .attr("width", widthWomen)//500
            .attr("height", heightWomen);//1000


        svgContainerW.append("svg:image")
            .attr("xlink:href", function (d, i) {
                return "./src/images/mujer.png";
            })
            .attr("x", function (d, i) {
                return 0
            })
            .attr("y", function (d, i) {
                return 0;
            })
            .attr("width", widthWomen)
            .attr("height", widthWomen);

        // svgContainerW.append("circle")
        //     .attr("cx", widthWomen * 0.500)//55
        //     .attr("cy", heightWomen*0.100)//30
        //     .attr("r", heightWomen*0.075)//20
        //     .attr("fill","#522B9E");

        // svgContainerW.selectAll("polygon")
        //     .data([polyWomen])
        //     .enter()
        //     .append("polygon")
        //     .attr("points",function(d) { 
        //         return d.map(function(d) { return [d.x,d.y].join(","); }).join(" ");})
        //     .attr("fill","#522B9E");

        svg.selectAll(".txt")
            .data(arrayNumber)
            .enter()
            .append("text")
            .text(0)
            .attr("class", "txt")
            .attr("x", function (d, i) {
                if (i == 0) {
                    return width / 2 - width / 4 - 15;
                } else {
                    return width / 2 + width / 4 + 15;
                }
            })
            .attr("y", function (d, i) {
                return heightChart;
            })
            .attr("text-anchor", function (d, i) {
                if (i == 0) {
                    return "end";
                } else {
                    return "start";
                }
            })
            .attr('font-size', '1.5vw')
            .attr("fill", function (d, i) {
                if (i == 0) {
                    return "#008086";
                } else {
                    return "#522B9E";
                }
            })
            .transition()
            .duration(750)
            .tween("text", function (d) {
                var that = d3.select(this);
                var i = d3.interpolateString(that.text(), d);
                var prec = (d + "").split(".")
                var round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;
                return function (t) { that.text((Math.round(i(t) * round) / round).toLocaleString('de-DE')); };
            })


        svg.selectAll(".txtPorcentaje")
            .data(porcentajesNumber)
            .enter()
            .append("text")
            .text(0)
            .attr("class", "txtPorcentaje")
            .attr("x", function (d, i) {
                if (i == 0) {
                    return width / 2 - width / 4 - 15;
                } else {
                    return width / 2 + width / 4 + 15;
                }
            })
            .attr("y", function (d, i) {
                return heightChart - 30;
            })
            .attr("text-anchor", function (d, i) {
                if (i == 0) {
                    return "end";
                } else {
                    return "start";
                }
            })
            .attr('font-size', '0.8em')
            .attr("fill", "#808080")
            .transition()
            .duration(750)
            .tween("text", function (d) {
                var that = d3.select(this);
                var i = d3.interpolateString(that.text(), d);
                var prec = (d + "").split(".")
                var round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;
                return function (t) { that.text(parseFloat(Math.round(i(t) * round) / round).toFixed(1).toLocaleString('de-DE') + "%"); };
            });

        svg.selectAll(".txtName")
            .data(arrayNumber)
            .enter()
            .append("text")
            .text(function (d, i) {
                if (i == 0) {
                    return "Hombres";
                } else {
                    return "Mujeres";
                }
            })
            .attr("class", "txtName")
            .attr("x", function (d, i) {
                if (i == 0) {
                    return width / 2 - width / 4 - 15;
                } else {
                    return width / 2 + width / 4 + 15;
                }
            })
            .attr("y", function (d, i) {
                return heightChart - 50;
            })
            .attr("text-anchor", function (d, i) {
                if (i == 0) {
                    return "end";
                } else {
                    return "start";
                }
            })
            .attr('font-size', '0.8em')
            .attr("fill", function (d, i) {
                if (i == 0) {
                    return "#008086";
                } else {
                    return "#522B9E";
                }
            });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("fill", "#3D3D3D")
            .attr('font-size', '0.8em')
            .attr('font-weight', '700')
            .attr("text-anchor", "middle")
            .attr('font-family', 'Roboto')
            .text("Población por sexo");

        svg.append("text")
            .attr("x", -90)
            .attr("y", height + margin.top + 10)
            .attr('font-size', '16px')
            .attr('font-weight', '400')
            .attr('font-style', 'italic')
            .attr("text-anchor", "start")
            .text("Población total: " + suma.toLocaleString('de-DE'));

        arrayNumber = {
            "name": "Quinquenios",
            "children": [
                {
                    "name": "Niños",
                    "children": [
                        { "name": "0 a 4 años", "size": parseInt(result[0]["PERSONAS_EDAD_0A4_ANNOS"]) },
                        { "name": "5 a 9 años", "size": parseInt(result[0]["PERSONAS_EDAD_5A9_ANNOS"]) },
                        { "name": "10 a 14 años", "size": parseInt(result[0]["PERSONAS_EDAD_10A14_ANNOS"]) }
                    ]
                },
                {
                    "name": "Adultos",
                    "children": [
                        { "name": "15 a 19 años", "size": parseInt(result[0]["PERSONAS_EDAD_15A20_ANNOS"]) },
                        { "name": "20 a 24 años", "size": parseInt(result[0]["PERSONAS_EDAD_29A24_ANNOS"]) },
                        { "name": "25 a 29 años", "size": parseInt(result[0]["PERSONAS_EDAD_25A29_ANNOS"]) },
                        { "name": "30 a 34 años", "size": parseInt(result[0]["PERSONAS_EDAD_30A34_ANNOS"]) },
                        { "name": "35 a 39 años", "size": parseInt(result[0]["PERSONAS_EDAD_35A39_ANNOS"]) },
                        { "name": "40 a 44 años", "size": parseInt(result[0]["PERSONAS_EDAD_40A44_ANNOS"]) },
                        { "name": "45 a 49 años", "size": parseInt(result[0]["PERSONAS_EDAD_45A49_ANNOS"]) },
                        { "name": "50 a 54 años", "size": parseInt(result[0]["PERSONAS_EDAD_50A54_ANNOS"]) },
                        { "name": "55 a 59 años", "size": parseInt(result[0]["PERSONAS_EDAD_55A59_ANNOS"]) }
                    ]
                },
                {
                    "name": "Adultos mayores",
                    "children": [
                        { "name": "60 a 64 años", "size": parseInt(result[0]["PERSONAS_EDAD_60A64_ANNOS"]) },
                        { "name": "65 a 69 años", "size": parseInt(result[0]["PERSONAS_EDAD_65A69_ANNOS"]) },
                        { "name": "70 a 74 años", "size": parseInt(result[0]["PERSONAS_EDAD_70A74_ANNOS"]) },
                        { "name": "75 a 79 años", "size": parseInt(result[0]["PERSONAS_EDAD_75A79_ANNOS"]) },
                        { "name": "80 ó más años", "size": parseInt(result[0]["PERSONAS_EDAD_80_O_MAS_ANNOS"]) }
                    ]
                },
                {
                    "name": "No informa",
                    "children": [
                        { "name": "No informa", "size": parseInt(result[0]["PERSONAS_EDAD_NO_INFORMA"]) }
                    ]
                }
            ]
        };
    }
}

function fechaActual() {
    var meses = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
    var fecha = new Date();
    return fecha.getDate() + " de " + meses[fecha.getMonth()] + " de " + fecha.getFullYear();
}

function cerrarPoly() {
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
}

function borrarPoly() {
    if ($var.Map.poly) {
        $var.Map.poly.setMap(null);
    }
    for (var i = 0; i < $var.Map.markers.length; i++) {
        $var.Map.markers[i].setMap(null);
    }
    $var.Map.markers = [];
    $var.Map.poly = new google.maps.Polyline({
        map: $var.Map.map,
        path: [],
        strokeColor: "#4dd1f2",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    $var.Map.isClosed = false;
}

function loadMapa3D() {
    initThree();
    initPositioningTransform();

    if ($("#FiltroGeograficoLvl1").val() == "-1") {
        if (typeMapDivision == 0) {
            var uriAux = "./src/data/departamentos.json";
        }
        else {
            var uriAux = "./src/data/municipios.json";
        }
    } else {
        var uriAux = "./src/data/municipios/" + $("#FiltroGeograficoLvl1").val() + ".json";
    }
    $.ajax({
        url: uriAux,
        dataType: "JSON",
        success: function (data) {
            initGeometry(data.features);
            updateMeshes();
        }
    });

    function initGeometry(features) {
        var path = d3.geo.path().projection(d3.geo.mercator().center(RO_CENTER));
        //c(features)
        features.forEach(function (feature) {
            var contour = transformSVGPath(path(feature)); //GEOMETRIA

            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                if (typeMapDivision == 0) {
                    var x = feature.properties.FID_ID;
                    var county = counties.get(x);
                    if (county) {
                        county.set('contour', contour);
                        county.set('name', feature.properties.DPTO_CNMBR);
                    }
                } else {
                    var x = feature.properties.FID_ID;
                    var county = counties.get(x);
                    if (county) {
                        county.set('contour', contour);
                        county.set('name', feature.properties.MPIO_CNMBR);
                    }
                }
            }
            else {
                var x = feature.properties.FID_ID;
                var county = counties.get(x);
                if (county) {
                    county.set('contour', contour);
                    county.set('name', feature.properties.MPIO_CNMBR);
                }
            }
            //TODO PARA OTRAS ENTIDADES GEOGRÁFICAS
        });

        // c(counties)
    }
}

// TODO
// var zoomIn = document.getElementById('ActionBar__Plus__btn');
// var zoomOut = document.getElementById('ActionBar__Minus__btn');

// google.maps.event.addDomListener(zoomOut, 'click', function() {
//     var zoomLevel = camera.position.z;
//     if(zoomLevel >= 0){
//         camera.position.z = zoomLevel - 10;           
//     }     
// });
// google.maps.event.addDomListener(zoomIn, 'click', function() {
//     var zoomLevel = camera.position.z;
//     if(zoomLevel < 100){
//         camera.position.z = zoomLevel + 10;           
//     }
// });

function loadWMS(urlWMS, nombreCapa) {
    $var.Map.map.overlayMapTypes.pop();
    $(".--uploadLayer .toolBar__container__panel__functionBox__checkList__item__text").text(nombreCapa)
    var map = $var.Map.map
    wmsLayer = new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            var proj = map.getProjection();
            var zfactor = Math.pow(2, zoom);
            // get Long Lat coordinates
            var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
            var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));
            //corrections for the slight shift of the SLP (mapserver)
            var deltaX = 0.0013;
            var deltaY = 0.00058;
            //create the Bounding box string
            var bbox = (top.lng() + deltaX) + "," +
                (bot.lat() + deltaY) + "," +
                (bot.lng() + deltaX) + "," +
                (top.lat() + deltaY);
            //base WMS URL
            //var url = "http://geoapps.ideam.gov.co:8080/geoserver/Agrometeorologia/wms"; //GDBIDEAM.ACC2014_LPAC_DE_1981_2010
            var url = urlWMS + "?";
            url += "VERSION=1.1.1"; //WMS operation
            url += "&REQUEST=GetMap"; //WMS operation
            url += "&LAYERS=" + nombreCapa; //WMS layers
            url += "&FORMAT=image/png";
            url += "&STYLES=";     //set STYLE
            url += "&SRS=EPSG:4326";     //set WGS84 
            url += "&BBOX=" + bbox;      // set bounding box
            url += "&WIDTH=256";         //tile size in google
            url += "&HEIGHT=256";
            return url;                 // return URL for the tile

        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 0.5,
        name: "UploadLayer",
        isPng: true
    });
    $var.Map.map.overlayMapTypes.push(wmsLayer);

    wms3DLayer = new maptalks.WMSTileLayer('wmsRes', {
        'urlTemplate': urlWMS + '?',
        'crs': 'EPSG:3857',
        'layers': nombreCapa,
        'styles': '',
        'version': '1.1.1',
        'format': 'image/png',
        'transparent': true
    });

    wms3DLayer.addTo($var.Map.map3D);

    // c($var.Map.map.overlayMapTypes)
    $(".--enlaceWMS").val("")
    $(".--nombreCapaWMS").val("")
    $(".--uploadLayer").addClass("--visible")
    $(".--uploadLayer .toolBar__container__panel__functionBox__checkList__item__container").addClass("--active")
}

function loadKML() {
    $var.Map.layers.kmlLayer.setMap(null);
    $var.Map.layers.kmlLayer.setMap($var.Map.map);
    if ($var.Map.layers3D.kmlLayer) {
        $var.Map.layers3D.kmlLayer.remove();
    }
    var form = new FormData()
    var filesKML = $(".toolBar__container__panel__functionBox__uploadType__type__upload__selectFile").prop("files")
    //c(filesKML)
    form.append("upload", filesKML[0])

    var settings = {
        url: serverPath + "upload.php",
        mimeType: "multipart/form-data",
        data: form,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        dataType: "json",
        type: 'POST'
    }

    $.ajax(settings)
        .done(function (response) {
            maptalks.Formats.kml("https://geoportal.dane.gov.co/upload/" + response.nombre, function (err, geojson) {
                // callback when loaded
                $var.Map.layers3D.kmlLayer = new maptalks.VectorLayer('kml', geojson).addTo($var.Map.map3D);
            });
            //TODO ERVISAR LOS KMLS GRANDES
            //console.log(response.split(".")[0])
            var name = response.nombre.split(".")[0]
            $var.Map.layers.kmlLayer.setUrl("https://geoportal.dane.gov.co/upload/" + response.nombre);

            google.maps.event.addListenerOnce($var.Map.layers.kmlLayer, 'status_changed', function () {
                // console.log('KML status is', $var.Map.layers.kmlLayer.getStatus());
                $(".toolBar__container__panel__functionBox__uploadType__type__seeLayer").removeClass('--active');
                switch ($var.Map.layers.kmlLayer.getStatus()) {
                    case "DOCUMENT_NOT_FOUND":
                        alert("Hubo un problema con la carga del archivo en el servidor");
                        break;
                    case "DOCUMENT_TOO_LARGE":
                        alert("El archivo KML excede los limites de tamaño permitidos");
                        break;
                    case "FETCH_ERROR":
                        alert("Hubo un problema con la carga del archivo en el servidor");
                        break;
                    case "INVALID_DOCUMENT":
                        alert("El formato del archivo no esta permitido");
                        break;
                    case "INVALID_REQUEST":
                        alert("El archivo no es valido");
                        break;
                    case "LIMITS_EXCEEDED":
                        alert("El archivo excede los limites de funciones permitidas");
                        break;
                    case "OK":
                        alert("El archivo se cargo correctamente");
                        $(".toolBar__container__panel__functionBox__uploadType__type__seeLayer").addClass('--active');
                        $(".--uploadLayer .toolBar__container__panel__functionBox__checkList__item__text").text(name)
                        $(".--uploadLayer").addClass("--visible")
                        $(".--uploadLayer .toolBar__container__panel__functionBox__checkList__item__container").addClass("--active")
                        break;
                    case "TIMED_OUT":
                        alert("El archivo no se pudo cargar en el tiempo establecido");
                        break;
                    case "UNKNOWN":
                        alert("El archivo no pudo ser cargado");
                        break;
                }
            });
        });
}

function calcularDimensiones() {
    var map = $var.Map.map
    var totalMedida;

    if (typeMedida == 0) {
        longitud = google.maps.geometry.spherical.computeLength(markersMedidas)
        notacion = " metros";
        if (map.getZoom() < 16) {
            totalMedida = (longitud / 1000).toLocaleString("De-de") + " kilómetros"
            $(".toolBar__container__panel__functionBox__textMeasureValue").text(totalMedida)
            labelMedida(markersMedidas, map, totalMedida, "linea") //Funcion que dibuja la medida en el centro
        }
        else {
            totalMedida = (longitud).toLocaleString("De-de") + " metros"
            $(".toolBar__container__panel__functionBox__textMeasureValue").text(totalMedida)
            labelMedida(markersMedidas, map, totalMedida, "linea") //Funcion que dibuja la medida en el centro
        }

    } else if (typeMedida == 1) {
        area = google.maps.geometry.spherical.computeArea(markersMedidas)
        // c(markersMedidas)
        // c(area)		
        if (map.getZoom() < 17) {
            totalMedida = (area / (1000 * 1000)).toLocaleString("De-de") + " kilómetros cuadrados"
            $(".toolBar__container__panel__functionBox__textMeasureValue").text(totalMedida)
            labelMedida(markersMedidas, map, totalMedida, "poligono") //Funcion que dibuja la medida en el centro
        }
        else {
            totalMedida = (area / (100 * 100)).toLocaleString("De-de") + " hectáreas"
            $(".toolBar__container__panel__functionBox__textMeasureValue").text(totalMedida)
            labelMedida(markersMedidas, map, totalMedida, "poligono") //Funcion que dibuja la medida en el centro
        }
    } else if (typeMedida == 2) {
        longitud = (google.maps.geometry.spherical.computeLength(markersMedidas))
        area = Math.PI * longitud * longitud
        if (map.getZoom() < 17) {
            totalMedida = (area / (1000 * 1000)).toLocaleString("De-de") + " kilómetros cuadrados"
            $(".toolBar__container__panel__functionBox__textMeasureValue").text(totalMedida)
            labelMedida(markersMedidas, map, totalMedida, "poligono") //Funcion que dibuja la medida en el centro
        }
        else {
            totalMedida = (area / (100 * 100)).toLocaleString("De-de") + " hectáreas"
            $(".toolBar__container__panel__functionBox__textMeasureValue").text(totalMedida)
            labelMedida(markersMedidas, map, totalMedida, "poligono") //Funcion que dibuja la medida en el centro
        }
    } else if (typeMedida == 3) {
        var c1 = new google.maps.LatLng(markersMedidas[0].lat(), markersMedidas[0].lng())
        var c2 = new google.maps.LatLng(markersMedidas[0].lat(), markersMedidas[1].lng())
        var c3 = new google.maps.LatLng(markersMedidas[1].lat(), markersMedidas[1].lng())
        var c4 = new google.maps.LatLng(markersMedidas[1].lat(), markersMedidas[0].lng())
        var array = [c1, c2, c3, c4];
        // c(c1.lat(),c1.lng())
        // c(c2.lat(),c2.lng())
        // c(c3.lat(),c3.lng())
        // c(c4.lat(),c4.lng())
        area = google.maps.geometry.spherical.computeArea(array)
        // c(area)
        if (map.getZoom() < 17) {
            totalMedida = (area / (1000 * 1000)).toLocaleString("De-de") + " kilómetros cuadrados"
            $(".toolBar__container__panel__functionBox__textMeasureValue").text(totalMedida)
            labelMedida(markersMedidas, map, totalMedida, "poligono") //Funcion que dibuja la medida en el centro
        }
        else {
            totalMedida = (area / (100 * 100)).toLocaleString("De-de") + " hectáreas"
            $(".toolBar__container__panel__functionBox__textMeasureValue").text(totalMedida)
            labelMedida(markersMedidas, map, totalMedida, "poligono") //Funcion que dibuja la medida en el centro
        }
    }
}

function labelMedida(rutaGeo, map, totalMedida, figura) {
    if (figura == "linea") {
        if (rutaGeo.length > 1) {
            centro = (google.maps.geometry.spherical.interpolate(rutaGeo[0], rutaGeo[rutaGeo.length - 1], 0.5))
        }
        else {
            centro = rutaGeo[0]
        }
    } else if (figura == "poligono") {
        var bounds = new google.maps.LatLngBounds()
        for (var i = 0; i < rutaGeo.length; i++) {
            bounds.extend(rutaGeo[i])
        }
        centro = bounds.getCenter()
    }


    limpiarMedida()
    var markerMedida = new MarkerWithLabel({
        position: centro,
        draggable: true,
        raiseOnDrag: true,
        map: map,
        icon: "src/images/nada.png",
        labelContent: totalMedida,
        labelAnchor: new google.maps.Point(22, 0),
        labelClass: "labels" // the CSS class for the label
    })
    arrayMarkersLabel.push(markerMedida)
}

function borrarMedida() {
    activeMedida = false;
    if (poligono != null) {
        poligono.setMap(null);
        poligono = null;
    }
    markersMedidas = [];
    for (var i = 0; i < arrayMarkers.length; i++) {
        arrayMarkers[i].setMap(null);
    }
    arrayMarkers = [];
    limpiarMedida()
    $(".toolBar__container__panel__functionBox__textMeasureValue").text("0")
    $(".toolBar__container__panel__functionBox__step__btnList__item").removeClass("--active")
    google.maps.event.removeListener(clicPunto);
    google.maps.event.clearListeners($var.Map.layers.layerDatos, 'click');
}

function limpiarMedida() {
    for (var j = 0; j < arrayMarkersLabel.length; j++) {
        arrayMarkersLabel[j].setMap(null);
    }
}

function loadToner() {
    var TonerMapTypeOptions = {
        getTileUrl: function (coord, zoom) {
            return "http://tile.stamen.com/toner/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "Toner",
        maxZoom: 18
    };

    var TonerMapType = new google.maps.ImageMapType(TonerMapTypeOptions);
    $var.Map.map.mapTypes.set('Toner', TonerMapType);
    $var.Map.map.setMapTypeId('Toner');
}

function loadTopografico() {
    var TopograficoMapTypeOptions = {
        getTileUrl: function (coord, zoom) {
            //return "https://maps.tilehosting.com/styles/topo/" + zoom + "/" + coord.x + "/" + coord.y + ".png?key=jdXM2rAj6hOnLzzdOzXC";
            return "https://c.tile.opentopomap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "Topografico",
        maxZoom: 18
    };

    $var.Map.baseMaps.topografico = new google.maps.ImageMapType(TopograficoMapTypeOptions);
    $var.Map.map.mapTypes.set('Topografico', $var.Map.baseMaps.topografico);
    $var.Map.map.setMapTypeId('Topografico');


    $var.Map.base3DMaps.topografico = new maptalks.TileLayer("tile", {
        urlTemplate: 'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd']
    });

    $var.Map.map3D.setBaseLayer($var.Map.base3DMaps.topografico)

}

function loadSatelital() {
    var SatelitalMapTypeOptions = {
        getTileUrl: function (coord, zoom) {
            return "http://mt1.google.com/vt/lyrs=s&hl=pl&&x=" + coord.x + "&y=" + coord.y + "&z=" + zoom;
        },
        tileSize: new google.maps.Size(256, 256),
        name: "Satelital",
        maxZoom: 18
    };

    $var.Map.baseMaps.satelital = new google.maps.ImageMapType(SatelitalMapTypeOptions);
    $var.Map.map.mapTypes.set('Satelital', $var.Map.baseMaps.satelital);
    $var.Map.map.setMapTypeId('Satelital');


    $var.Map.base3DMaps.satelital = new maptalks.TileLayer("tile", {
        urlTemplate: 'https://khms1.googleapis.com/kh?v=845&hl=es-ES&x={x}&y={y}&z={z}',
        attribution: '&copy; <a href="http://ditu.google.cn/">Google</a>'
    });

    $var.Map.map3D.setBaseLayer($var.Map.base3DMaps.satelital)
}

function loadHibrido() {
    var HybridMapTypeOptions = {
        getTileUrl: function (coord, zoom) {
            return "http://mt1.google.com/vt/lyrs=y&x=" + coord.x + "&y=" + coord.y + "&z=" + zoom;
        },
        tileSize: new google.maps.Size(256, 256),
        name: "Hibrido",
        maxZoom: 18
    };

    $var.Map.baseMaps.hybrid = new google.maps.ImageMapType(HybridMapTypeOptions);
    $var.Map.map.mapTypes.set('Hibrido', $var.Map.baseMaps.hybrid);
    $var.Map.map.setMapTypeId('Hibrido');


    $var.Map.base3DMaps.hybrid = new maptalks.TileLayer("tile", {
        urlTemplate: 'http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        attribution: '&copy; <a href="http://ditu.google.cn/">Google</a>'
    });

    $var.Map.map3D.setBaseLayer($var.Map.base3DMaps.hybrid)
}

function loadGris() {
    $var.Map.map.mapTypes.set('Gris', $var.Map.baseMaps.gris);
    $var.Map.baseMaps.gris.setOpacity(1);
    $var.Map.map.setMapTypeId('Gris');


    $var.Map.base3DMaps.gris = new maptalks.TileLayer("google", {
        urlTemplate: 'https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i458165170!3m14!2ses-ES!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy5lOmd8cC5jOiNmZmY1ZjVmNSxzLmU6bC5pfHAudjpvZmYscy5lOmwudC5mfHAuYzojZmY2MTYxNjEscy5lOmwudC5zfHAuYzojZmZmNWY1ZjUscy50OjIxfHMuZTpsLnQuZnxwLmM6I2ZmYmRiZGJkLHMudDoyfHMuZTpnfHAuYzojZmZlZWVlZWUscy50OjJ8cy5lOmwudC5mfHAuYzojZmY3NTc1NzUscy50OjQwfHMuZTpnfHAuYzojZmZlNWU1ZTUscy50OjQwfHMuZTpsLnQuZnxwLmM6I2ZmOWU5ZTllLHMudDozfHMuZTpnfHAuYzojZmZmZmZmZmYscy50OjUwfHMuZTpsLnQuZnxwLmM6I2ZmNzU3NTc1LHMudDo0OXxzLmU6Z3xwLmM6I2ZmZGFkYWRhLHMudDo0OXxzLmU6bC50LmZ8cC5jOiNmZjYxNjE2MSxzLnQ6NTF8cy5lOmwudC5mfHAuYzojZmY5ZTllOWUscy50OjY1fHMuZTpnfHAuYzojZmZlNWU1ZTUscy50OjY2fHMuZTpnfHAuYzojZmZlZWVlZWUscy50OjZ8cy5lOmd8cC5jOiNmZmM5YzljOSxzLnQ6NnxzLmU6bC50LmZ8cC5jOiNmZjllOWU5ZQ!4e0&token=32965',
        attribution: '&copy; <a href="http://ditu.google.cn/">Google</a>'
    });

    $var.Map.map3D.setBaseLayer($var.Map.base3DMaps.gris)
}

function loadNoche() {
    $var.Map.map.mapTypes.set('Noche', $var.Map.baseMaps.noche);
    $var.Map.baseMaps.noche.setOpacity(1);
    $var.Map.map.setMapTypeId('Noche');


    $var.Map.base3DMaps.noche = new maptalks.TileLayer("google", {
        urlTemplate: 'https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i490200282!3m17!2ses-ES!3sUS!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy5lOmd8cC5jOiNmZjIxMjEyMSxzLmU6bC5pfHAudjpvZmYscy5lOmwudC5mfHAuYzojZmY3NTc1NzUscy5lOmwudC5zfHAuYzojZmYyMTIxMjEscy50OjF8cy5lOmd8cC5jOiNmZjc1NzU3NSxzLnQ6MTd8cy5lOmwudC5mfHAuYzojZmY5ZTllOWUscy50OjIxfHAudjpvZmYscy50OjE5fHMuZTpsLnQuZnxwLmM6I2ZmYmRiZGJkLHMudDoyfHMuZTpsLnQuZnxwLmM6I2ZmNzU3NTc1LHMudDo0MHxzLmU6Z3xwLmM6I2ZmMTgxODE4LHMudDo0MHxzLmU6bC50LmZ8cC5jOiNmZjYxNjE2MSxzLnQ6NDB8cy5lOmwudC5zfHAuYzojZmYxYjFiMWIscy50OjN8cy5lOmcuZnxwLmM6I2ZmMmMyYzJjLHMudDozfHMuZTpsLnQuZnxwLmM6I2ZmOGE4YThhLHMudDo1MHxzLmU6Z3xwLmM6I2ZmMzczNzM3LHMudDo0OXxzLmU6Z3xwLmM6I2ZmM2MzYzNjLHMudDo3ODV8cy5lOmd8cC5jOiNmZjRlNGU0ZSxzLnQ6NTF8cy5lOmwudC5mfHAuYzojZmY2MTYxNjEscy50OjR8cy5lOmwudC5mfHAuYzojZmY3NTc1NzUscy50OjZ8cy5lOmd8cC5jOiNmZjAwMDAwMCxzLnQ6NnxzLmU6bC50LmZ8cC5jOiNmZjNkM2QzZA!4e0&key=AIzaSyDk4C4EBWgjuL1eBnJlu1J80WytEtSIags&token=30387',
        attribution: '&copy; <a href="http://ditu.google.cn/">Google</a>'
    });

    $var.Map.map3D.setBaseLayer($var.Map.base3DMaps.noche)
}

function loadOSM() {
    var OSMMapTypeOptions = {
        getTileUrl: function (coord, zoom) {
            return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OSM",
        maxZoom: 18
    };

    $var.Map.baseMaps.osm = new google.maps.ImageMapType(OSMMapTypeOptions);
    $var.Map.map.mapTypes.set('OSM', $var.Map.baseMaps.osm);
    $var.Map.map.setMapTypeId('OSM');


    $var.Map.base3DMaps.osm = new maptalks.TileLayer("tile", {
        urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    });

    $var.Map.map3D.setBaseLayer($var.Map.base3DMaps.osm)
}

function loadTerreno() {
    var TerrainMapTypeOptions = {
        getTileUrl: function (coord, zoom) {
            return "http://tile.stamen.com/terrain/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "Terrain",
        maxZoom: 18
    };

    $var.Map.baseMaps.terrain = new google.maps.ImageMapType(TerrainMapTypeOptions);
    $var.Map.map.mapTypes.set('Terrain', $var.Map.baseMaps.terrain);
    $var.Map.map.setMapTypeId('Terrain');


    $var.Map.base3DMaps.terrain = new maptalks.TileLayer("tile", {
        urlTemplate: "http://tile.stamen.com/terrain/{z}/{x}/{y}.png"
    });

    $var.Map.map3D.setBaseLayer($var.Map.base3DMaps.terrain)
}

function crearMarker(lat, lng, title, texto) {
    var myLatLng = { lat: lat, lng: lng };
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: $var.Map.map,
        title: title,
        //icon: pinImage,
        latitud: lat,
        longitud: lng,
        customInfo: texto,
        zIndex: 2
    });

    arrayPuntos.push(marker);

    marker.addListener('click', function (event) {
        var contentString = marker['customInfo'];
        abrirInfoWindowDatos(event, contentString);
    });
}

function loadResguardos() {
    var map = $var.Map.map
    $var.Map.layers.resguardos = new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            var proj = map.getProjection();
            var zfactor = Math.pow(2, zoom);
            // get Long Lat coordinates
            var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
            var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));
            //corrections for the slight shift of the SLP (mapserver)
            var deltaX = 0.0013;
            var deltaY = 0.00058;
            //create the Bounding box string
            var bbox = (top.lng() + deltaX) + "," +
                (bot.lat() + deltaY) + "," +
                (bot.lng() + deltaX) + "," +
                (top.lat() + deltaY);
            //base WMS URL
            var url = "https://geoserverportal.dane.gov.co/geoserver2/dig/wms?";
            url += "VERSION=1.1.1"; //WMS operation
            url += "&REQUEST=GetMap"; //WMS operation
            url += "&LAYERS=" + "dig:RESGUARDOS_INDIGENAS"; //WMS layers
            url += "&FORMAT=image/png";
            url += "&TRANSPARENT=true";     //set WGS84 
            url += "&SRS=EPSG:4326";     //set WGS84 
            url += "&BBOX=" + bbox;      // set bounding box
            url += "&WIDTH=256";         //tile size in google
            url += "&HEIGHT=256";
            return url;                 // return URL for the tile

        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 1,
        name: "Resguardos",
        isPng: true
    });
    map.overlayMapTypes.push($var.Map.layers.resguardos);


    // $var.Map.layers3D.resguardos = new maptalks.WMSTileLayer('wmsRes', {
    //     'urlTemplate': 'https://geoserverportal.dane.gov.co/geoserver2/dig/wms?',
    //     'crs': 'EPSG:3857',
    //     'layers': 'dig:RESGUARDOS_INDIGENAS',
    //     'styles': '',
    //     'version': '1.1.1',

    //     'format': 'image/png',
    //     'transparent': true
    // }).addTo($var.Map.map3D);

    $(".loader").removeClass('--active');
}

function loadParques() {
    var map = $var.Map.map
    $var.Map.layers.pnn = new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            var proj = map.getProjection();
            var zfactor = Math.pow(2, zoom);
            // get Long Lat coordinates
            var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
            var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));
            //corrections for the slight shift of the SLP (mapserver)
            var deltaX = 0.0013;
            var deltaY = 0.00058;
            //create the Bounding box string
            var bbox = (top.lng() + deltaX) + "," +
                (bot.lat() + deltaY) + "," +
                (bot.lng() + deltaX) + "," +
                (top.lat() + deltaY);
            //base WMS URL
            var url = "https://geoserverportal.dane.gov.co/geoserver2/dig/wms?";
            url += "VERSION=1.1.1"; //WMS operation
            url += "&REQUEST=GetMap"; //WMS operation
            url += "&LAYERS=" + "dig:PARQUES_NATURALES"; //WMS layers
            url += "&FORMAT=image/png";
            url += "&TRANSPARENT=true";     //set WGS84 
            url += "&SRS=EPSG:4326";     //set WGS84 
            url += "&BBOX=" + bbox;      // set bounding box
            url += "&WIDTH=256";         //tile size in google
            url += "&HEIGHT=256";
            return url;                 // return URL for the tile

        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 1,
        name: "Parques",
        isPng: true
    });
    map.overlayMapTypes.push($var.Map.layers.pnn);

    // Carga mapa de Parque Nacionales en visualización de perspectiva
    // $var.Map.layers3D.pnn = new maptalks.WMSTileLayer('wms', {
    //     'urlTemplate': 'https://geoserverportal.dane.gov.co/geoserver2/dig/wms?',
    //     'crs': 'EPSG:3857',
    //     'layers': 'dig:PARQUES_NATURALES',
    //     'styles': '',
    //     'version': '1.1.1',
    //     'format': 'image/png',
    //     'transparent': true
    // }).addTo($var.Map.map3D);

    $(".loader").removeClass('--active');
}

function loadConsejos() {
    var map = $var.Map.map
    $var.Map.layers.consejos = new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            var proj = map.getProjection();
            var zfactor = Math.pow(2, zoom);
            // get Long Lat coordinates
            var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
            var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));
            //corrections for the slight shift of the SLP (mapserver)
            var deltaX = 0.0013;
            var deltaY = 0.00058;
            //create the Bounding box string
            var bbox = (top.lng() + deltaX) + "," +
                (bot.lat() + deltaY) + "," +
                (bot.lng() + deltaX) + "," +
                (top.lat() + deltaY);
            //base WMS URL
            var url = "https://geoserverportal.dane.gov.co/geoserver2/dig/wms?";
            url += "VERSION=1.1.1"; //WMS operation
            url += "&REQUEST=GetMap"; //WMS operation
            url += "&LAYERS=" + "dig:CONSEJOS_COM_NEGROS"; //WMS layers
            url += "&FORMAT=image/png";
            url += "&TRANSPARENT=true";     //set WGS84 
            url += "&SRS=EPSG:4326";     //set WGS84 
            url += "&BBOX=" + bbox;      // set bounding box
            url += "&WIDTH=256";         //tile size in google
            url += "&HEIGHT=256";
            return url;                 // return URL for the tile

        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 1,
        name: "Consejos",
        isPng: true
    });
    map.overlayMapTypes.push($var.Map.layers.consejos);

    // Carga mapa de consejos de negros en visualización de perspectiva
    // $var.Map.layers3D.consejos = new maptalks.WMSTileLayer('wmsCon', {
    //     'urlTemplate': 'https://geoserverportal.dane.gov.co/geoserver2/dig/wms?',
    //     'crs': 'EPSG:3857',
    //     'layers': 'dig:CONSEJOS_COM_NEGROS',
    //     'styles': '',
    //     'version': '1.1.1',
    //     'format': 'image/png',
    //     'transparent': true
    // }).addTo($var.Map.map3D);

    $(".loader").removeClass('--active');
}

function loadCampesinos() {
    var map = $var.Map.map
    $var.Map.layers.campesinos = new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            var proj = map.getProjection();
            var zfactor = Math.pow(2, zoom);
            // get Long Lat coordinates
            var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
            var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));
            //corrections for the slight shift of the SLP (mapserver)
            var deltaX = 0.0013;
            var deltaY = 0.00058;
            //create the Bounding box string
            var bbox = (top.lng() + deltaX) + "," +
                (bot.lat() + deltaY) + "," +
                (bot.lng() + deltaX) + "," +
                (top.lat() + deltaY);
            //base WMS URL
            var url = "https://geoserverportal.dane.gov.co/geoserver2/dig/wms?";
            url += "VERSION=1.1.1"; //WMS operation
            url += "&REQUEST=GetMap"; //WMS operation
            url += "&LAYERS=" + "dig:ZONAS_RESERVA_CAMPESINA"; //WMS layers
            url += "&FORMAT=image/png";
            url += "&TRANSPARENT=true";     //set WGS84 
            url += "&SRS=EPSG:4326";     //set WGS84 
            url += "&BBOX=" + bbox;      // set bounding box
            url += "&WIDTH=256";         //tile size in google
            url += "&HEIGHT=256";
            return url;                 // return URL for the tile

        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 1,
        name: "Campesina",
        isPng: true
    });
    map.overlayMapTypes.push($var.Map.layers.campesinos);

    // Carga mapa de Reserva de Campesinos en visualización de perspectiva
    // $var.Map.layers3D.campesinos = new maptalks.WMSTileLayer('wmsCam', {
    //     'urlTemplate': 'https://geoserverportal.dane.gov.co/geoserver2/dig/wms?',
    //     'crs': 'EPSG:3857',
    //     'layers': 'dig:ZONAS_RESERVA_CAMPESINA',
    //     'styles': '',
    //     'version': '1.1.1',
    //     'format': 'image/png',
    //     'transparent': true
    // }).addTo($var.Map.map3D);

    $(".loader").removeClass('--active');
}

function loadVeredas() {
    var map = $var.Map.map
    $var.Map.layers.veredas = new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            var proj = map.getProjection();
            var zfactor = Math.pow(2, zoom);
            // get Long Lat coordinates
            var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
            var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));
            //corrections for the slight shift of the SLP (mapserver)
            var deltaX = 0.0013;
            var deltaY = 0.00058;
            //create the Bounding box string
            var bbox = (top.lng() + deltaX) + "," +
                (bot.lat() + deltaY) + "," +
                (bot.lng() + deltaX) + "," +
                (top.lat() + deltaY);
            //base WMS URL
            var url = "https://geoserverportal.dane.gov.co/geoserver2/dig/wms?";
            url += "VERSION=1.1.1"; //WMS operation
            url += "&REQUEST=GetMap"; //WMS operation
            url += "&LAYERS=" + "dig:VEREDAS_2017"; //WMS layers
            url += "&FORMAT=image/png";
            url += "&TRANSPARENT=true";     //set WGS84 
            url += "&SRS=EPSG:4326";     //set WGS84 
            url += "&BBOX=" + bbox;      // set bounding box
            url += "&WIDTH=256";         //tile size in google
            url += "&HEIGHT=256";
            return url;                 // return URL for the tile

        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 1,
        name: "Veredas",
        isPng: true
    });
    map.overlayMapTypes.push($var.Map.layers.veredas);

    // Carga mapa de Veredas en visualización de perspectiva
    // $var.Map.layers3D.veredas = new maptalks.WMSTileLayer('wmsVer', {
    //     'urlTemplate': 'https://geoserverportal.dane.gov.co/geoserver2/dig/wms?',
    //     'crs': 'EPSG:3857',
    //     'layers': 'dig:VEREDAS_2017',
    //     'styles': '',
    //     'version': '1.1.1',
    //     'format': 'image/png',
    //     'transparent': true
    // }).addTo($var.Map.map3D);

    $(".loader").removeClass('--active');
}

function RemoveAccents(str) {
    var strIn = str.toString();
    var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
    strIn = strIn.split('');
    var strLen = strIn.length;
    var i, x;
    for (i = 0; i < strLen; i++) {
        if ((x = accents.indexOf(strIn[i])) != -1) {
            strIn[i] = accentsOut[x];
        }
    }
    return strIn.join('');
}

function getNumber(valor) {
    if (valor == "") {
        return "0";
    } else if (valor == undefined) {
        return "0";
    } else {
        return valor;
    }
}

function abrirInfoWindowDatos(event, contentString) {
    if ($var.Map.infoWindow != null) {
        $var.Map.infoWindow.close();
    }
    $var.Map.infoWindow.setContent(contentString);
    $var.Map.infoWindow.setPosition(event.latLng);
    $var.Map.infoWindow.open($var.Map.map);
}

function printResults() {
    $(".loader").addClass('--active');

    $(".toolBar").addClass("--collapse")
    $(".results").addClass("--collapse")
    $(".functionClose__btn").addClass("--printing")
    $(".map").addClass("--collapseRight").addClass("--collapseLeft")
    $(".gmnoprint").hide();//Quita los controles del mapa

    var doc = new jsPDF('portrait', 'mm', 'letter');   //216 279 Ancho 206 Alto 269

    doc.addFileToVFS("OpenSans-Regular.ttf", $var.Map.fontPrintOpenSans);
    doc.addFont('OpenSans-Regular.ttf', 'CustomFont', 'normal');

    var s = new XMLSerializer();
    var widthPrint = 201
    var yPosLineTwo = 0;

    html2canvas(document.querySelector(".Header__container__logo")).then(function (canvas) {
        var bodyWidth = $("body").width() / 2;
        var ratioCanvasPrint = canvas.height / canvas.width
        var canvasWidthPrint = canvas.width * 206 / bodyWidth;
        var canvasHeightPrint = canvasWidthPrint * ratioCanvasPrint;
        var yPosCanvas = 10;
        var xPosCanvas = 10;

        doc.addImage(canvas.toDataURL(), 'PNG', xPosCanvas, yPosCanvas, canvasWidthPrint, canvasHeightPrint);

        html2canvas(document.querySelector(".Header__container__textBox__geoportal")).then(function (canvasGeo) {
            var ratioCanvasGeoPrint = canvasGeo.height / canvasGeo.width
            var canvasGeoWidthPrint = canvasGeo.width * 206 / bodyWidth;
            var canvasGeoHeightPrint = canvasGeoWidthPrint * ratioCanvasGeoPrint;
            var yPosCanvasGeo = 10 + (canvasHeightPrint - canvasGeoHeightPrint)
            var xPosCanvasGeo = canvasWidthPrint + 20;

            doc.addImage(canvasGeo.toDataURL(), 'PNG', xPosCanvasGeo, yPosCanvasGeo, canvasGeoWidthPrint, canvasGeoHeightPrint);

            var xPosTitle = xPosCanvasGeo + canvasGeoWidthPrint + 10;
            var yPosTitle = yPosCanvasGeo + (2 * canvasGeoHeightPrint / 3);

            doc.setFont('CustomFont');
            doc.setFontSize(12);
            doc.setTextColor(61, 61, 61);
            doc.text($(".Header__container__textBox__title").text(), xPosTitle, yPosTitle);

            doc.setFont('helvetica');
            doc.setFontType('normal');
            doc.setFontSize(10);
            doc.text(fechaActual(), 206, 10, 'right');

            doc.setLineWidth(0.3)
            doc.setDrawColor(226, 226, 226) // draw red lines
            doc.line(52, yPosTitle + 4, 154, yPosTitle + 4);


            var yPosTema = yPosTitle + 10;
            var xPosTema = 10;
            doc.setTextColor(61, 61, 61)
            doc.setFontSize(10);
            doc.text('Tema: ' + $(".--tema.--active .--nameTema").text().toUpperCase(), xPosTema, yPosTema, 'left');
            doc.text('Subtema: ' + $("#results__panel__title__themeName").text(), xPosTema, yPosTema + 5, 'left');
            doc.text('Año: ' + $("#tiempoAnual").val(), xPosTema, yPosTema + 10, 'left');
            doc.text('Desagregación geográfica: ' + $("#results__panel__title__site").text(), xPosTema, yPosTema + 15, 'left');

            yPosLineTwo = yPosTema + 19;

            doc.setLineWidth(0.3)
            doc.setDrawColor(226, 226, 226) // draw red lines
            doc.line(52, yPosLineTwo, 154, yPosLineTwo);

            //c(yPosLineTwo)

            if (document.querySelector(".map__legend svg")) {
                var str = s.serializeToString(document.querySelector(".map__legend svg"));
                canvg(document.getElementById('canvasLeyenda'), str);
                $("#canvasLeyenda").show()
                $(".map__legend svg").hide()
            }

            // if(document.querySelector(".map__legend_2 svg")){
            //     var strSimbolos = s.serializeToString(document.querySelector(".map__legend_2 svg"));
            //     canvg(document.getElementById('map__legend__symbol'), strSimbolos);
            //     $("#map__legend__symbol").show()
            //     $(".map__legend_2 svg").hide()
            // }

            html2canvas(document.querySelector(".map"), { useCORS: true }).then(function (canvasMap) {
                var ratioCanvasMapPrint = canvasMap.height / canvasMap.width
                var CanvasMapWidthPrint = canvasMap.width * 206 / $("body").width();
                var CanvasMapHeightPrint = CanvasMapWidthPrint * ratioCanvasMapPrint;
                var yPosMapa = yPosLineTwo + 5;
                var xPosMapa = 5;

                doc.setFontSize(10)
                doc.text('Mapa', 10, yPosMapa - 2)

                doc.addImage(canvasMap.toDataURL(), 'PNG', xPosMapa, yPosMapa, CanvasMapWidthPrint, CanvasMapHeightPrint);

                doc.setFontSize(10)
                doc.text($(".results__panel__source__name").text(), 206, 269, 'right')

                if (document.querySelector(".Modal__panel__graphs svg")) {
                    var yPrintGraph = yPosMapa + CanvasMapHeightPrint + 5;
                    doc.setFontSize(10)
                    doc.text('Resultado temático', 10, yPrintGraph)

                    var str = s.serializeToString(document.querySelector(".Modal__panel__graphs svg"));
                    canvg(document.querySelector('.Modal__panel__graphs_canvas'), str);
                    $(".Modal__panel__graphs_canvas").show()
                    $(".Modal__panel__graphs svg").hide()
                    var modalGraphImage = document.querySelector('.Modal__panel__graphs_canvas').toDataURL("image/png")
                    var ratio = $(".Modal__panel__graphs_canvas").height() / $(".Modal__panel__graphs_canvas").width()
                    if (((widthPrint * ratio) + yPrintGraph) > 269) {
                        var xPrintGraph = (widthPrint - (2 * widthPrint / 3)) / 2
                        var widthPrintGraph = (2 * widthPrint / 3)
                        var heightPrintGraph = widthPrintGraph * ratio;
                    }
                    else {
                        var xPrintGraph = 5
                        var widthPrintGraph = widthPrint
                        var heightPrintGraph = widthPrint * ratio;
                    }
                    doc.addImage(modalGraphImage, 'PNG', xPrintGraph, yPrintGraph, widthPrintGraph, heightPrintGraph); //24.07 96.41 5.18346001

                    doc.setLineWidth(0.5)
                    doc.setDrawColor(0, 0, 0)
                    doc.rect(5, 5, 206, 269);
                }
                if (document.querySelector(".Modal__panel__dona svg")) { //Puede o no estar           
                    doc.addPage()

                    doc.addImage(canvas.toDataURL(), 'PNG', xPosCanvas, yPosCanvas, canvasWidthPrint, canvasHeightPrint);
                    doc.addImage(canvasGeo.toDataURL(), 'PNG', xPosCanvasGeo, yPosCanvasGeo, canvasGeoWidthPrint, canvasGeoHeightPrint);

                    var xPosTitle = xPosCanvasGeo + canvasGeoWidthPrint + 10;
                    var yPosTitle = yPosCanvasGeo + (2 * canvasGeoHeightPrint / 3);

                    doc.setFont('CustomFont');
                    doc.setFontSize(12);
                    doc.setTextColor(61, 61, 61);
                    doc.text($(".Header__container__textBox__title").text(), xPosTitle, yPosTitle);

                    doc.setFont('helvetica');
                    doc.setFontType('normal');
                    doc.setFontSize(10);
                    doc.text(fechaActual(), 206, 10, 'right');

                    doc.setLineWidth(0.3)
                    doc.setDrawColor(226, 226, 226) // draw red lines
                    doc.line(52, yPosTitle + 4, 154, yPosTitle + 4);


                    var yPosTema = yPosTitle + 10;
                    var xPosTema = 10;
                    doc.setTextColor(61, 61, 61)
                    doc.setFontSize(10);
                    doc.text('Tema: ' + $(".--tema.--active .--nameTema").text().toUpperCase(), xPosTema, yPosTema, 'left');
                    doc.text('Subtema: ' + $("#results__panel__title__themeName").text(), xPosTema, yPosTema + 5, 'left');
                    doc.text('Año: ' + $("#tiempoAnual").val(), xPosTema, yPosTema + 10, 'left');
                    doc.text('Desagregación geográfica: ' + $("#results__panel__title__site").text(), xPosTema, yPosTema + 15, 'left');

                    yPosLineTwo = yPosTema + 19;

                    doc.setLineWidth(0.3)
                    doc.setDrawColor(226, 226, 226) // draw red lines
                    doc.line(52, yPosLineTwo, 154, yPosLineTwo);

                    doc.setFontSize(10)
                    doc.text($(".results__panel__source__name").text(), 206, 269, 'right') //

                    var yPrintDona = yPosLineTwo + 5;
                    doc.setFontSize(10)
                    doc.text('Desagregación por clase', 10, yPrintDona)

                    var str = s.serializeToString(document.querySelector(".Modal__panel__dona svg"));
                    canvg(document.querySelector('.Modal__panel__dona_canvas'), str);
                    $(".Modal__panel__dona_canvas").show()
                    $(".Modal__panel__dona svg").hide()

                    var modalDonaImage = document.querySelector('.Modal__panel__dona_canvas').toDataURL("image/png")
                    var ratio = $(".Modal__panel__dona_canvas").height() / $(".Modal__panel__dona_canvas").width();
                    var heightPrintDona = widthPrint * ratio;
                    doc.addImage(modalDonaImage, 'PNG', 5, yPrintDona + 10, widthPrint, heightPrintDona); //24.07 96.41 5.18346001
                    doc.setLineWidth(0.5)
                    doc.setDrawColor(0, 0, 0)
                    doc.rect(5, 5, 206, 269);
                }
                if (document.querySelector(".Modal__panel__participacion svg")) {
                    doc.addPage()

                    doc.addImage(canvas.toDataURL(), 'PNG', xPosCanvas, yPosCanvas, canvasWidthPrint, canvasHeightPrint);
                    doc.addImage(canvasGeo.toDataURL(), 'PNG', xPosCanvasGeo, yPosCanvasGeo, canvasGeoWidthPrint, canvasGeoHeightPrint);

                    var xPosTitle = xPosCanvasGeo + canvasGeoWidthPrint + 10;
                    var yPosTitle = yPosCanvasGeo + (2 * canvasGeoHeightPrint / 3);

                    doc.setFont('CustomFont');
                    doc.setFontSize(12);
                    doc.setTextColor(61, 61, 61);
                    doc.text($(".Header__container__textBox__title").text(), xPosTitle, yPosTitle);

                    doc.setFont('helvetica');
                    doc.setFontType('normal');
                    doc.setFontSize(10);
                    doc.text(fechaActual(), 206, 10, 'right');

                    doc.setLineWidth(0.3)
                    doc.setDrawColor(226, 226, 226) // draw red lines
                    doc.line(52, yPosTitle + 4, 154, yPosTitle + 4);


                    var yPosTema = yPosTitle + 10;
                    var xPosTema = 10;
                    doc.setTextColor(61, 61, 61)
                    doc.setFontSize(10);
                    doc.text('Tema: ' + $(".--tema.--active .--nameTema").text().toUpperCase(), xPosTema, yPosTema, 'left');
                    doc.text('Subtema: ' + $("#results__panel__title__themeName").text(), xPosTema, yPosTema + 5, 'left');
                    doc.text('Año: ' + $("#tiempoAnual").val(), xPosTema, yPosTema + 10, 'left');
                    doc.text('Desagregación geográfica: ' + $("#results__panel__title__site").text(), xPosTema, yPosTema + 15, 'left');

                    yPosLineTwo = yPosTema + 19;

                    doc.setLineWidth(0.3)
                    doc.setDrawColor(226, 226, 226) // draw red lines
                    doc.line(52, yPosLineTwo, 154, yPosLineTwo);

                    doc.setFontSize(10)
                    doc.text($(".results__panel__source__name").text(), 206, 269, 'right') //

                    var yPrintParticipacion = yPosLineTwo + 5;

                    doc.setFontSize(10)
                    doc.text('Participación ente territorial', 10, yPrintParticipacion)

                    var str = s.serializeToString(document.querySelector(".Modal__panel__participacion svg"));
                    canvg(document.querySelector('.Modal__panel__participacion_canvas'), str);
                    $(".Modal__panel__participacion_canvas").show()
                    $(".Modal__panel__participacion svg").hide()

                    var modalParticipacionImage = document.querySelector('.Modal__panel__participacion_canvas').toDataURL("image/png")
                    var ratio = $(".Modal__panel__participacion_canvas").height() / $(".Modal__panel__participacion_canvas").width();
                    var heightPrintParticipacion = widthPrint * ratio;
                    doc.addImage(modalParticipacionImage, 'PNG', 5, yPrintParticipacion + 10, widthPrint, heightPrintParticipacion); //24.07 96.41 5.18346001
                    doc.setLineWidth(0.5)
                    doc.setDrawColor(0, 0, 0)
                    doc.rect(5, 5, 206, 269);
                }
                if (document.querySelector(".Modal__panel__frequency svg")) {
                    doc.addPage()

                    doc.addImage(canvas.toDataURL(), 'PNG', xPosCanvas, yPosCanvas, canvasWidthPrint, canvasHeightPrint);
                    doc.addImage(canvasGeo.toDataURL(), 'PNG', xPosCanvasGeo, yPosCanvasGeo, canvasGeoWidthPrint, canvasGeoHeightPrint);

                    var xPosTitle = xPosCanvasGeo + canvasGeoWidthPrint + 10;
                    var yPosTitle = yPosCanvasGeo + (2 * canvasGeoHeightPrint / 3);

                    doc.setFont('CustomFont');
                    doc.setFontSize(12);
                    doc.setTextColor(61, 61, 61);
                    doc.text($(".Header__container__textBox__title").text(), xPosTitle, yPosTitle);

                    doc.setFont('helvetica');
                    doc.setFontType('normal');
                    doc.setFontSize(10);
                    doc.text(fechaActual(), 206, 10, 'right');

                    doc.setLineWidth(0.3)
                    doc.setDrawColor(226, 226, 226) // draw red lines
                    doc.line(52, yPosTitle + 4, 154, yPosTitle + 4);


                    var yPosTema = yPosTitle + 10;
                    var xPosTema = 10;
                    doc.setTextColor(61, 61, 61)
                    doc.setFontSize(10);
                    doc.text('Tema: ' + $(".--tema.--active .--nameTema").text().toUpperCase(), xPosTema, yPosTema, 'left');
                    doc.text('Subtema: ' + $("#results__panel__title__themeName").text(), xPosTema, yPosTema + 5, 'left');
                    doc.text('Año: ' + $("#tiempoAnual").val(), xPosTema, yPosTema + 10, 'left');
                    doc.text('Desagregación geográfica: ' + $("#results__panel__title__site").text(), xPosTema, yPosTema + 15, 'left');

                    yPosLineTwo = yPosTema + 19;

                    doc.setLineWidth(0.3)
                    doc.setDrawColor(226, 226, 226) // draw red lines
                    doc.line(52, yPosLineTwo, 154, yPosLineTwo);

                    var yPrintFrecuencia = yPosLineTwo + 5;

                    doc.setFontSize(10)
                    doc.text('Frecuencia', 10, yPrintFrecuencia)

                    var str = s.serializeToString(document.querySelector(".Modal__panel__frequency svg"));
                    canvg(document.querySelector('.Modal__panel__frequency_canvas'), str);
                    $(".Modal__panel__frequency_canvas").show()
                    $(".Modal__panel__frequency svg").hide()

                    var modalFrecuenciaImage = document.querySelector('.Modal__panel__frequency_canvas').toDataURL("image/png")
                    var ratio = $(".Modal__panel__frequency_canvas").height() / $(".Modal__panel__frequency_canvas").width();
                    var heightPrintFrecuencia = widthPrint * ratio;
                    doc.addImage(modalFrecuenciaImage, 'PNG', 5, yPrintFrecuencia + 10, widthPrint, heightPrintFrecuencia); //24.07 96.41 5.18346001
                    doc.setLineWidth(0.5)
                    doc.setDrawColor(0, 0, 0)
                    doc.rect(5, 5, 206, 269);
                }
                if (document.querySelector(".Modal__panel__historico svg")) {

                    var yPrintHistorico = yPrintFrecuencia + 20 + heightPrintFrecuencia;

                    doc.setFontSize(10)
                    doc.text('Histórico', 10, yPrintHistorico)

                    var str = s.serializeToString(document.querySelector(".Modal__panel__historico svg"));
                    canvg(document.querySelector('.Modal__panel__historico_canvas'), str);
                    $(".Modal__panel__historico_canvas").show()
                    $(".Modal__panel__historico svg").hide()

                    var modalHistoricoImage = document.querySelector('.Modal__panel__historico_canvas').toDataURL("image/png")
                    var ratio = $(".Modal__panel__historico_canvas").height() / $(".Modal__panel__historico_canvas").width();
                    var heightPrintHistorico = widthPrint * ratio;
                    doc.addImage(modalHistoricoImage, 'PNG', 5, yPrintHistorico, widthPrint, heightPrintHistorico); //24.07 96.41 5.18346001

                    doc.setLineWidth(0.5)
                    doc.setDrawColor(0, 0, 0)
                    doc.rect(5, 5, 206, 269);

                    doc.setFontSize(10)
                    doc.text($(".results__panel__source__name").text(), 206, 269, 'right') //
                }

                doc.save(RemoveAccents($("#results__panel__title__themeName").text().replaceAll(" ", "_")) + '_' + RemoveAccents($("#results__panel__title__site").text().replaceAll(" ", "_")) + '.pdf'); //Guarda el archivo pdf
                $("#canvasLeyenda").hide()
                $("#map__legend__symbol").removeClass('--visible')
                $(".map__legend svg").show()
                $(".map__legend_2 svg").show()
                $(".toolBar").removeClass("--collapse")
                $(".functionClose__btn").removeClass("--printing")
                $(".results").removeClass("--collapse")
                $(".map").removeClass("--collapseRight").removeClass("--collapseLeft")
                $(".PrintModal canvas").hide();
                $(".PrintModal svg").show();
                $(".loader").removeClass('--active');
            });

        });
    });
}

function translation(x, y) {
    return 'translate(' + x + ',' + y + ')';
}

Array.prototype.unique = function (a) {
    return function () { return this.filter(a) }
}(function (a, b, c) {
    return c.indexOf(a, b + 1) < 0
});

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function initThree() {
    initRenderer();

    raycaster = new THREE.Raycaster();
    scene = new THREE.Scene();

    initCamera();
    initLights();
    animate();
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize($("#3Dmap").width(), $("#3Dmap").height());
    if ($("#function__darkMode").val() == "1") {
        renderer.setClearColor(0xC9C9C9);
    } else {
        renderer.setClearColor(0x01010A);
    }
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    $("#3Dmap canvas").remove();
    $("#3Dmap").append(renderer.domElement);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(30, $("#3Dmap").width() / $("#3Dmap").height(), 1, 10000);
    camera.position.z = 100;
    if ($("#FiltroGeograficoLvl1").val() != "-1") {
        camera.position.z = 50;
    } else {
        camera.position.z = 100;
    }
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
}

function initLights() {
    var light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(-100, 0, 100);
    light.position.multiplyScalar(0.8);

    //light.castShadow = true;
    //light.shadowCameraVisible = true;

    light.shadowMapWidth = 8192;
    light.shadowMapHeight = 8192;

    var d = 200;

    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d;
    light.shadowCameraBottom = -d;

    light.shadowCameraFar = 500;
    light.shadowDarkness = 0.4;

    scene.add(light);
}

function animate() {
    controls.update();
    render();
    updateInfoBox();
    idAnimation = requestAnimationFrame(animate);
}

function updateInfoBox() {
    raycaster.setFromCamera(mouse, camera);

    intersects = raycaster.intersectObjects(scene.children);
    var html = '';
    var color;
    if ($var.Map.clickableLayer) {
        for (var i = 0; i < intersects.length; i++) {
            for (var j = 1; j < scene.children.length; j++) {
                var countyCode = scene.children[j].userData.countyCode;
                if (countyCode) {
                    var county = counties.get(countyCode);
                    var elevation = county.get("variable");
                    var color = colorFill(elevation);
                    var red = hexToR(color) / 255;
                    var green = hexToG(color) / 255;
                    var blue = hexToB(color) / 255;
                    var colorthre = new THREE.Color(red, green, blue);
                    scene.children[j].material.materials[1].color = colorthre;
                }
            }
            var countyCode = intersects[i].object.userData.countyCode;
            if (countyCode) {
                intersects[i].object.material.materials[1].color = { r: 0.6470588235294118, g: 0.0784313725490196, b: 0.2901960784313725 }
                if (countyCode == "881") countyCode = "88"
                var county = counties.get(countyCode);

                var elevation = county.get($("#variable3D").val());
                var variableMapa = county.get("variable");
                var tipoDiv = getTipoDiv();

                if (tipoDiv == "VA") {
                    html = "<h4 class='locationPopUp__title'>Información</h4>"
                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'> " + county.get('name') + " - " + county.get('code') + "</strong></p>"
                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + (getNumber(county.get("variable"))).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + "<br>" + "</p>"
                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + $("#variable3D :selected").text() + " (Elevación):</strong> " + parseFloat(getNumber(elevation)).toLocaleString("De-de") + "</p>";
                }
                else if (tipoDiv == "VC" || tipoDiv == "C" || tipoDiv == "VAC" || tipoDiv == "S") {
                    html = "<h4 class='locationPopUp__title'>Información</h4>"
                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'> " + county.get('name') + " - " + county.get('code') + "</strong></p>"
                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + getNombreVariable($var.Map.varVariable) + ":</strong> " + parseFloat(parseFloat(getNumber(county.get("variable"))).toFixed(1)).toLocaleString("de-DE") + "% (" + getValorPorcentaje(getNumber(county.get("variable")), countyCode).toLocaleString("de-De") + " " + getUnidades($var.Map.varVariable) + ")<br>" + "</p>"
                        + "<p class='locationPopUp__text'><strong class='locationPopUp__text__bold'>" + $("#variable3D :selected").text() + " (Elevación):</strong> " + parseFloat(getNumber(elevation)).toLocaleString("De-de") + "</p>";
                }

                // html = county.get('name') + ': ' + elevation.toLocaleString('de-DE') + "%";	

                d3.select(".tooltip").remove();
                div = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip");

                var reverseX = $("#3Dmap").width() * ((mouse.x + 1) / 2)
                var reverseY = $("#3Dmap").height() * ((- mouse.y + 1) / 2) + ($(".Header").height())

                div.selectAll("text").remove();
                div.append("text")
                    .html(html);
                div.style("left", (reverseX + 40) + "px")
                    .style("top", (reverseY) + "px");
                break;
            }
        }
    }

    if (intersects.length == 0) {
        d3.select(".tooltip").remove();
        for (i = 1; i < scene.children.length; i++) {
            var countyCode = scene.children[i].userData.countyCode;
            if (countyCode) {
                var county = counties.get(countyCode);
                var elevation = county.get("variable");
                var color = colorFill(elevation);
                var red = hexToR(color) / 255;
                var green = hexToG(color) / 255;
                var blue = hexToB(color) / 255;
                var colorthre = new THREE.Color(red, green, blue);
                scene.children[i].material.materials[1].color = colorthre;
            }
        }
    }
}

function render() {
    renderer.render(scene, camera);
}

function initPositioningTransform() {
    positioning = new THREE.Matrix4();

    var tmp = new THREE.Matrix4();
    positioning.multiply(tmp.makeRotationX(Math.PI));
}

function updateMeshes(value) {
    // remove current meshes
    extr.length = 0;
    meshes.forEach(function (mesh) {
        scene.remove(mesh);
    });

    meshes = counties.entries().map(function (entry) {
        var countyCode = entry.key;
        var county = entry.value;
        var elevation = county.get($("#variable3D").val());

        var variableMapa = county.get("variable");
        if (value == null) {
            var extrusion = getExtrusion(elevation);
        }
        else {
            var extrusion = 1
        }
        var color = colorFill(variableMapa);

        // c(extrusion)

        var extrudeMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, opacity: percentageMapOpacity, transparent: true });
        var faceMaterial = new THREE.MeshBasicMaterial({ color: color, opacity: percentageMapOpacity, transparent: true });
        var material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, wireframeLinewidth: 10 });

        var geometry = county.get('contour').extrude({
            amount: extrusion,
            bevelEnabled: false,
            extrudeMaterial: 0,
            material: 1
        });

        var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([extrudeMaterial, faceMaterial]));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.countyCode = countyCode;
        extr.push(extrusion);
        scene.add(mesh);
        return mesh;
    });
    centro(meshes);
}

function isFloat(n) {
    return n === +n && n !== (n | 0);
}

function isInteger(n) {
    return n === +n && n === (n | 0);
}

function centro(todo) {
    var x = 0, y = 0, z = 0;
    var cont = 0;
    for (var i = 0; i < todo.length; i++) {
        var length = todo[i].geometry.vertices.length;
        for (var j = 0; j < length; j++) {
            x += todo[i].geometry.vertices[j].x;
            y += todo[i].geometry.vertices[j].y;
            z += todo[i].geometry.vertices[j].z;
            cont += 1;
        }
    }
    x = x / cont;
    y = y / cont * -1;
    z = z / cont;
    for (var i = 0; i < todo.length; i++) {
        meshes[i].applyMatrix(positioning);
    }
    for (var i = 0; i < todo.length; i++) {
        meshes[i].position.x = meshes[i].position.x - x;
        meshes[i].position.y = meshes[i].position.y - y;
        meshes[i].position.z = extr[i];
    }
}
// */

//* Función - Mover mouse
function onDocumentMouseMove(event) {
    mouse.x = ((event.clientX / $("#3Dmap").width()) * 2) - 1;
    mouse.y = - (((event.clientY - ($(".Header").height())) / $("#3Dmap").height()) * 2) + 1;
}

function hexToR(h) { return parseInt((cutHex(h)).substring(0, 2), 16) }
function hexToG(h) { return parseInt((cutHex(h)).substring(2, 4), 16) }
function hexToB(h) { return parseInt((cutHex(h)).substring(4, 6), 16) }
function cutHex(h) { return (h.charAt(0) == "#") ? h.substring(1, 7) : h }
// */

//* Evento - Envía el valor de la "Región o Dpto" seleccionada
$("#FiltroGeograficoLvl1").on("change", function () {
    // c($("#FiltroGeograficoLvl1").val());
    filtroGeoLvI($("#FiltroGeograficoLvl1").val());
});
// */

//* Función - Recibe el Id del Departamento y retorna los municipios del mismo
function filtroGeoLvI(idLvl1) {

    $var.Map.address = "";
    $var.Map.filtro = null;
    $var.Map.dpto.removeClass("--active");
    $var.Map.mpio.removeClass("--active");
    $var.Map.dpto.parent().removeClass("--visible");
    $var.Map.mpio.parent().removeClass("--visible");

    $(".loader").addClass('--active');
    $(".map__transparency").removeClass("--invisible");
    $("#toolBar__btn3D").parent().removeClass("--invisible");
    $("#FiltroGeograficoLvl3").parent().addClass("--invisible");
    $("#toolBar__btnPalette").parent().removeClass("--invisible");
    $(".map__transparency__slideTrans__scrollBtn").css("left", "0px");
    $(".toolBar__container__panel__functionBox__BaseMapList__item").removeClass("--active");
    $(this).parent().addClass("--active");
    $(this).parent().find(".toolBar__container__panel__functionBox__BaseMapList__slideTrans__scrollBtn").css("left", "0px");
    $(".map__legend__list").addClass("--invisible");
    if ($("#FiltroGeograficoLvl1").val() == "-1") {
        $("#FiltroGeograficoLvl2").val("-1");
        $("#FiltroGeograficoLvl3").val("-1");
        loadEstadisticas(varTema, varSubtema, varVariable);
        $("#place__department").text("Todos los departamentos");
        $("#place__municipality").text("Todos los municipios");
        $("#results__panel__title__site").text("Todos los departamentos");
        $("#FiltroGeograficoLvl2").parent().addClass("--invisible");
    } else {
        urlDivipola = 'https://geoportal.dane.gov.co/laboratorio/serviciosjson/visor_sise/divipola.php' + "?codigo_departamento=" + idLvl1;
        $.ajax({
            url: urlDivipola,
            type: "GET",
            success: function (data) {
                if (data.resultado.length > 0) {
                    listaDivipolaMpios = []
                    $("#FiltroGeograficoLvl2").parent().removeClass("--invisible")
                    $("#FiltroGeograficoLvl2").html("");
                    $('<option value="-1">Todos los municipios</option>').appendTo($("#FiltroGeograficoLvl2"));
                    $("#place__department").text($("#FiltroGeograficoLvl1 :selected").text())
                    $("#place__municipality").text("Todos los municipios")
                    $("#results__panel__title__site").text($("#FiltroGeograficoLvl1 :selected").text())
                    for (var i = 0; i < data.resultado.length; i++) {
                        $('<option value="' + data.resultado[i]["CODIGO_MUNICIPIO"] + '">' + data.resultado[i]["CODIGO_MUNICIPIO"] + " - " + data.resultado[i]["NOMBRE_MUNICIPIO"] + '</option>').appendTo($("#FiltroGeograficoLvl2"));
                        listaDivipolaMpios.push([data.resultado[i]["CODIGO_MUNICIPIO"], data.resultado[i]["NOMBRE_MUNICIPIO"]])
                    }
                    loadEstadisticas(varTema, varSubtema, varVariable, idLvl1, null)
                }
            }
        });
    }
    loadGris();
    loadCapas();
}
// */

//* Evento - Envía el valor del "Mpio" seleccionado
$("#FiltroGeograficoLvl2").on("change", function () {
    $(".loader").addClass('--active');
    $("#place__department").text($("#FiltroGeograficoLvl1 :selected").text());
    $("#results__panel__title__site").text($("#FiltroGeograficoLvl2 :selected").text());
    filtroGeoLv2($("#FiltroGeograficoLvl2").val());
});
// */

//* Función - Recibe el Id del Municipio y hace el zoom geográfico al mismo
function filtroGeoLv2(idLvl2) {

    $var.Map.address = "";
    $var.Map.filtro = null;
    $(".loader").addClass('--active');
    $(".map__transparency").removeClass("--invisible");
    $("#toolBar__btn3D").parent().removeClass("--invisible");
    $("#toolBar__btnPalette").parent().removeClass("--invisible");
    $(".map__transparency__slideTrans__scrollBtn").css("left", "0px");
    $(".toolBar__container__panel__functionBox__BaseMapList__item").removeClass("--active");
    // Captura el elemento HTML
    var manzana = $(".--manzana > div.toolBar__container__panel__functionBox__checkList__item__container");
    $var.Map.dpto.removeClass("--active");
    $var.Map.mpio.removeClass("--active");
    $var.Map.dpto.parent().removeClass("--visible");
    $var.Map.mpio.parent().removeClass("--visible");
    $(".map__legend__list").addClass("--invisible");
    if ($("#FiltroGeograficoLvl2").val() == "-1") {
        $("#FiltroGeograficoLvl3").val("-1");
        $("#place__municipality").text("Todos los municipios");
        $("#results__panel__title__site").text("Todos los municipios");
        $("#FiltroGeograficoLvl3").parent().addClass("--invisible")
        $(this).parent().addClass("--active");
        $(this).parent().find(".toolBar__container__panel__functionBox__BaseMapList__slideTrans__scrollBtn").css("left", "0px");
        loadGris();
        loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), null)
    } else {

        $var.Map.filtroTema = false;
        $var.Map.dpto.addClass("--active");
        $var.Map.mpio.addClass("--active");
        $var.Map.dpto.parent().addClass("--visible");
        $var.Map.mpio.parent().addClass("--visible");
        $var.Map.filtro = "(MPIO_CCDGO = '" + idLvl2 + "')";
        $(".map__transparency").addClass("--invisible");
        $("#toolBar__btn3D").parent().addClass("--invisible");
        $("#BaseMapList__hibrido").parent().addClass("--active")
        $("#toolBar__btnPalette").parent().addClass("--invisible");
        $("#FiltroGeograficoLvl3").parent().removeClass("--invisible");
        $(".map__transparency__slideTrans__scrollBtn").css("left", "100%");
        $("#place__municipality").text(($("#FiltroGeograficoLvl2 :selected").text()));
        $(".functionFilter__container__selectListbox__selectList__item.level3").removeClass("--active");
        $("#BaseMapList__hibrido").find(".toolBar__container__panel__functionBox__BaseMapList__slideTrans__scrollBtn").css("left", "0px")
        $("#results__panel__title__site").text($("#FiltroGeograficoLvl1 :selected").text() + " - " + ($("#FiltroGeograficoLvl2 :selected").text()));
        loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), idLvl2);
    }
    loadCapas();
}
// */

//* Evento - Envía el valor de la zona (urbano o rural) seleccionado de la subregión
$("#FiltroTotalLvl1").on("change", function () {
    varTema = $("#FiltroTotalLvl1").val().substring(0, 3)
    varSubtema = $("#FiltroTotalLvl1").val().substring(0, 5)
    $var.Map.varVariable = $("#FiltroTotalLvl1").val()

    $("#variable3D").html("")
    for (var i = 0; i < totalSubtemas.length; i++) {
        if (totalSubtemas[i]["COD_SUBGRUPO"] == $("#FiltroTotalLvl1").val().substring(0, 5)) {
            $('<option value=' + totalSubtemas[i]["COD_CATEGORIA"] + ' class="function3D__container__switch__content__option">' + totalSubtemas[i]["CATEGORIA"] + '</option>').appendTo($("#variable3D"));
        }
    }

    loadDataDirectorio()

    $(".loader").addClass('--active');
    if ($("#FiltroGeograficoLvl1").val() == "-1") {
        loadEstadisticas(varTema, varSubtema, varVariable)
        $("#place__department").text("Todos los departamentos")
        $("#place__municipality").text("Todos los municipios")
        $("#results__panel__title__site").text("Todos los departamentos")
    } else {
        if ($("#FiltroGeograficoLvl2").val() == "-1") {
            loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), null)
            $("#place__municipality").text("Todos los municipios");
            $("#results__panel__title__site").text("Todos los municipios");
        }
        else {
            loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
            $("#place__municipality").text(($("#FiltroGeograficoLvl2 :selected").text()));
            $("#results__panel__title__site").text($("#FiltroGeograficoLvl1 :selected").text() + " - " + ($("#FiltroGeograficoLvl2 :selected").text()));
        }
    }
})
// */

$("#FiltroGeograficoLvl2").on("change", function () {
    $(".loader").addClass('--active');
    if ($("#FiltroGeograficoLvl2").val() == "-1") {
        loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), null)
        $("#place__municipality").text("Todos los municipios");
        $("#results__panel__title__site").text("Todos los municipios");
    } else {
        loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
        $("#place__municipality").text(($("#FiltroGeograficoLvl2 :selected").text()));
        $("#results__panel__title__site").text($("#FiltroGeograficoLvl1 :selected").text() + " - " + ($("#FiltroGeograficoLvl2 :selected").text()));
        loadCapas();
    }
})
// */

//* Función - Cargar capas del MGN
function loadCapas() {
    setTimeout(function () {
        load2017();
        // c('loadCapas()');
    }, 400);
}
//*/

//* Carga capas del MGN para la vigencia 2017
function load2017() {
    if ($var.Map.map.overlayMapTypes) {
        $var.Map.map.overlayMapTypes.clear();
    }

    if ($(".toolBar__container__panel__functionBox__checkList__item.--municipio").hasClass("--visible")) {
        $var.Map.layers.mpios = new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
                var proj = $var.Map.map.getProjection();
                var zfactor = Math.pow(2, zoom);
                // get Long Lat coordinates
                var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
                var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));
                //corrections for the slight shift of the SLP (mapserver)
                var deltaX = 0; // 0.0013;
                var deltaY = 0; // 0.00058;
                //create the Bounding box string
                var bbox = (top.lng() + deltaX) + "," +
                    (bot.lat() + deltaY) + "," +
                    (bot.lng() + deltaX) + "," +
                    (top.lat() + deltaY);
                //base WMS URL
                var url = "https://geoserverportal.dane.gov.co/geoserver2/dig/wms?";
                url += "VERSION=1.1.0"; //WMS operation
                url += "&REQUEST=GetMap"; //WMS operation
                url += "&LAYERS=" + "dig:V2017_MGN_MPIO_POLITICO"; //WMS layers
                url += "&FORMAT=image/png";
                url += "&TRANSPARENT=true";     //set WGS84 
                url += "&SRS=EPSG:4326";     //set WGS84 
                url += "&BBOX=" + bbox;      // set bounding box
                url += "&WIDTH=256";         //tile size in google
                url += "&HEIGHT=256";
                return url;                 // return URL for the tile

            },
            tileSize: new google.maps.Size(256, 256),
            opacity: 1,
            name: "Municipios",
            isPng: true
        });
        $var.Map.map.overlayMapTypes.push($var.Map.layers.mpios);
        $(".loader").removeClass('--active');
    }
    if ($(".toolBar__container__panel__functionBox__checkList__item.--departamento").hasClass("--visible")) {
        $var.Map.layers.deptos = new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
                var proj = $var.Map.map.getProjection();
                var zfactor = Math.pow(2, zoom);
                // get Long Lat coordinates
                var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
                var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));
                //corrections for the slight shift of the SLP (mapserver)
                var deltaX = 0; // 0.0013;
                var deltaY = 0; // 0.00058;
                //create the Bounding box string
                var bbox = (top.lng() + deltaX) + "," +
                    (bot.lat() + deltaY) + "," +
                    (bot.lng() + deltaX) + "," +
                    (top.lat() + deltaY);
                //base WMS URL
                var url = "https://geoserverportal.dane.gov.co/geoserver2/dig/wms?";
                url += "VERSION=1.1.0"; //WMS operation
                url += "&REQUEST=GetMap"; //WMS operation
                url += "&LAYERS=" + "dig:V2017_MGN_DPTO_POLITICO"; //WMS layers
                url += "&FORMAT=image/png";
                url += "&TRANSPARENT=true";     //set WGS84 
                url += "&SRS=EPSG:4326";     //set WGS84 
                url += "&BBOX=" + bbox;      // set bounding box
                url += "&WIDTH=256";         //tile size in google
                url += "&HEIGHT=256";
                // console.log(url);
                return url;                 // return URL for the tile
            },
            tileSize: new google.maps.Size(256, 256),
            opacity: 1,
            name: "Departamentos",
            isPng: true
        });
        $var.Map.map.overlayMapTypes.push($var.Map.layers.deptos);
        $(".loader").removeClass('--active');
    }
    selectedLayer($var.Map.typename, $var.Map.filtro);
}
//*/

// */

//*  Resalta el elemento geográfico seleccionado
function selectedLayer(layer, id) {
    // c(layer, id);
    $var.Map.map.overlayMapTypes.forEach(function (item, index) {
        // console.log(index, item.name);
        if (item.name == "Selected") {
            $var.Map.map.overlayMapTypes.pop(index);
        }
    });
    $var.Map.layers.selected = new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            var proj = $var.Map.map.getProjection();
            var zfactor = Math.pow(2, zoom);
            // get Long Lat coordinates
            var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
            var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));
            //corrections for the slight shift of the SLP (mapserver)
            var deltaX = 0; // 0.0013;
            var deltaY = 0; // 0.00058;
            //create the Bounding box string
            var bbox = (top.lng() + deltaX) + "," +
                (bot.lat() + deltaY) + "," +
                (bot.lng() + deltaX) + "," +
                (top.lat() + deltaY);
            //base WMS URL
            var url = "https://geoserverportal.dane.gov.co/geoserver2/dig/wms?";
            url += "VERSION=1.1.0"; //WMS operation
            url += "&REQUEST=GetMap"; //WMS operation
            url += "&LAYERS=" + layer; //WMS layers
            url += "&FORMAT=image/png";
            url += "&TRANSPARENT=true";     //set WGS84 
            url += "&SRS=EPSG:4326";     //set WGS84 
            url += "&BBOX=" + bbox;      // set bounding box
            url += "&WIDTH=256";         //tile size in google
            url += "&HEIGHT=256";
            url += "&STYLES=CYAN";
            url += "&CQL_FILTER=" + id + "";
            return url;
        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 1,
        name: "Selected",
        isPng: true
    });
    $var.Map.map.overlayMapTypes.push($var.Map.layers.selected);
}
// */

//* Evento - valida cuando se selecciona un año para mostrar los datos correspondientes
$("#tiempoAnual").on("change", function () {
    $(".loader").addClass('--active');
    $("#place__time").text(($("#tiempoAnual").val()));
    if ($("#FiltroGeograficoLvl1").val() == "-1") {
        loadEstadisticas(varTema, varSubtema, varVariable)
    } else {
        if ($("#FiltroGeograficoLvl2").val() == "-1") {
            loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), null)
        }
        else {
            loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
        }
    }

})

$("#variable3D").on("change", function () {
    arrayMax = [];
    counties.forEach(function (d, a) {
        arrayMax.push(a.get($("#variable3D").val()));
    })
    max_population = d3.max(arrayMax)
    min_population = d3.min(arrayMax)
    getExtrusion = d3.scale.linear().domain([min_population, max_population]).range([0, MAX_EXTRUSION]);
    updateMeshes();
})

$("#DownloadExt__shp").on("click", function () {
    var options = {
        folder: "my-shapefile",
        types: {
            point: "points",
            polygon: "polygons",
            line: "lines"
        }
    }
    shpwrite.download(datosMapa, options);
});

$("#DownloadExt__gml").on("click", function () {
    // c(geomToGml)
    // c(datosMapa)
    var asd = geomToGml.geomToGml(datosMapa.features[0].geometry);
    // c(asd)
});




$(".function3D__container__switch__content__input").on("click", function () {
    if ($(this).is(":checked")) {
        updateMeshes()
    } else {
        updateMeshes(1)
    }
})

$(".map__view__Dptos__btn").on("click", function () {
    if (typeMapDivision == 1) {
        typeMapDivision = 0
        $(this).addClass("--active")
        $(".map__view__Mpios__btn").removeClass("--active")
        $(".loader").addClass('--active');
        if ($("#FiltroGeograficoLvl1").val() == "-1") {
            loadEstadisticas(varTema, varSubtema, varVariable)
        }
        else {
            if ($("#FiltroGeograficoLvl2").val() == "-1") {
                loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), null)
            }
            else {
                loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
            }
        }
    }
})

$(".map__view__Mpios__btn").on("click", function () {
    if (typeMapDivision == 0) {
        typeMapDivision = 1
        $(this).addClass("--active")
        $(".map__view__Dptos__btn").removeClass("--active")
        $(".loader").addClass('--active');
        if ($("#FiltroGeograficoLvl1").val() == "-1") {
            loadEstadisticas(varTema, varSubtema, varVariable)
        }
        else {
            if ($("#FiltroGeograficoLvl2").val() == "-1") {
                loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), null)
            }
            else {
                loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
            }
        }
    }
})

$(".map__legend .functionClose__btn").on("click", function () {
    $(".map__legend svg").toggleClass("hidden")
    $(".map__legend .functionClose__btn").toggleClass("--active")
});

$(".map__tinyMap .functionClose__btn").on("click", function () {
    $(".map__tinyMap .map__tinyMap__map").toggleClass("--hidden")
    $(".map__tinyMap .functionClose__btn").toggleClass("--active")
    $(".map__tinyMap").toggleClass("--hidden")
});

$(".map__close_street__close").on("click", function () {
    $var.Map.panorama.setVisible(false)
});

//Pallette
$("#functionPalette__maptype").on("change", function () {
    typeMap = $("#functionPalette__maptype").val()
    if ($("#FiltroGeograficoLvl1").val() == "-1") {
        reloadEstadisticas(varTema, varSubtema, varVariable)
    } else if ($("#FiltroGeograficoLvl2").val() == "-1") {
        reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), null)
    } else {
        reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
    }
})

$("#functionPalette__classMethod").on("change", function () {
    typeDivision = $("#functionPalette__classMethod").val()
    if ($("#FiltroGeograficoLvl1").val() == "-1") {
        reloadEstadisticas(varTema, varSubtema, varVariable)
    } else if ($("#FiltroGeograficoLvl2").val() == "-1") {
        reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), null)
    } else {
        reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
    }
})


$("#functionPalette__numberMethod").on("change", function () {
    numberClass = $("#functionPalette__numberMethod").val()
    $(".functionPalette__paletteList__color").hide();
    switch (numberClass) {
        case "1":
            $(".c4").show();
            break;
        case "2":
            $(".c4").show();
            $(".c5").show();
            break;
        case "3":
            $(".c2").show();
            $(".c4").show();
            $(".c6").show();
            break;
        case "4":
            $(".c2").show();
            $(".c4").show();
            $(".c6").show();
            $(".c8").show();
            break;
        case "5":
            $(".c0").show();
            $(".c2").show();
            $(".c4").show();
            $(".c6").show();
            $(".c8").show();
            break;
        case "6":
            $(".c0").show();
            $(".c2").show();
            $(".c4").show();
            $(".c5").show();
            $(".c6").show();
            $(".c8").show();
            break;
        case "7":
            $(".c0").show();
            $(".c2").show();
            $(".c3").show();
            $(".c4").show();
            $(".c5").show();
            $(".c6").show();
            $(".c8").show();
            break;
        case "8":
            $(".c0").show();
            $(".c1").show();
            $(".c2").show();
            $(".c3").show();
            $(".c4").show();
            $(".c5").show();
            $(".c6").show();
            $(".c8").show();
            break;
        case "9":
            $(".c1").show();
            $(".c2").show();
            $(".c3").show();
            $(".c4").show();
            $(".c5").show();
            $(".c6").show();
            $(".c7").show();
            $(".c8").show();
            break;
    }
    if ($("#FiltroGeograficoLvl1").val() == "-1") {
        reloadEstadisticas(varTema, varSubtema, varVariable)
    } else if ($("#FiltroGeograficoLvl2").val() == "-1") {
        reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), null)
    } else {
        reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
    }
})

$("#function__darkMode").on("change", function () {
    if ($(this).val() == "1") {
        $("body").removeClass("--darkMode")
        if ($("#BaseMapList__gris").parent().hasClass("--active")) {
            loadGris();
        }
    } else {
        $("body").addClass("--darkMode")
        if ($("#BaseMapList__gris").parent().hasClass("--active")) {
            loadNoche();
        }
    }
});

$(".functionPalette__container__selectListbox__selectList").on("click", function () {
    if ($(".functionPalette__container__selectListbox__selectList__item.--active").attr("id") == "paletteColor__blue") {
        colorClass = ["#08306b", "#08519c", "#2171b5", "#4292c6", "#6baed6", "#9ecae1", "#c6dbef", "#deebf7", "#f7fbff"]
    } else if ($(".functionPalette__container__selectListbox__selectList__item.--active").attr("id") == "paletteColor__red") {
        colorClass = ["#67000d", "#a50f15", "#cb181d", "#ef3b2c", "#fb6a4a", "#fc9272", "#fcbba1", "#fee0d2", "#fff5f0"]
    } else if ($(".functionPalette__container__selectListbox__selectList__item.--active").attr("id") == "paletteColor__orange") {
        colorClass = ["#662506", "#993404", "#cc4c02", "#ec7014", "#fe9929", "#fec44f", "#fee391", "#fff7bc", "#ffffe5"]
    } else if ($(".functionPalette__container__selectListbox__selectList__item.--active").attr("id") == "paletteColor__green") {
        colorClass = ["#004529", "#006837", "#238443", "#41ab5d", "#78c679", "#addd8e", "#d9f0a3", "#f7fcb9", "#ffffe5"]
    } else if ($(".functionPalette__container__selectListbox__selectList__item.--active").attr("id") == "paletteColor__yellow") {
        colorClass = ["#7e501d", "#8e642f", "#9e7941", "#ad8d53", "#bda266", "#cdb678", "#ddca8a", "#ecdf9c", "#fcf3ae"]
    } else if ($(".functionPalette__container__selectListbox__selectList__item.--active").attr("id") == "paletteColor__purple") {
        colorClass = ["#49006a", "#7a0177", "#ae017e", "#dd3497", "#f768a1", "#fa9fb5", "#fcc5c0", "#fde0dd", "#fff7f3"]
    } else if ($(".functionPalette__container__selectListbox__selectList__item.--active").attr("id") == "paletteColor__original") {
        colorClass = ""
    }
    if ($("#FiltroGeograficoLvl1").val() == "-1") {
        reloadEstadisticas(varTema, varSubtema, varVariable)
    } else if ($("#FiltroGeograficoLvl2").val() == "-1") {
        reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), null)
    } else {
        reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
    }
})

$(".toolBar__container__panel__functionBox__radioList__item").on("click", function () {
    if ($(".toolBar__btnAnalysis").hasClass("--active")) {
        if ($(this).hasClass("--AnalysisArea")) {
            metodo = 0;
            $var.Map.activadoPoly = false;
            $var.Map.circuloAnalisis.setMap($var.Map.map);
            if (heatmap != null) {
                heatmap.setMap(null)
            }
            $("#frequencyGraph").remove();
        }
        else if ($(this).hasClass("--AnalysisDrayarea")) {
            metodo = 1;
            $var.Map.activadoPoly = true;
            $var.Map.circuloAnalisis.setMap(null);
            $var.Map.poly = new google.maps.Polyline({
                map: $var.Map.map,
                path: [],
                strokeColor: "#4dd1f2",
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            if (heatmap != null) {
                heatmap.setMap(null)
            }
            $("#frequencyGraph").remove();
        }
        else if ($(this).hasClass("--AnalysisHouseConcentration")) {
            metodo = 2;
            $var.Map.activadoPoly = false;
            $var.Map.circuloAnalisis.setMap(null);
            $("#frequencyGraph").remove();
        }
    } else {
        // TODO PARA CENSO 0 ES TOTAL, 1 CABECERA Y 4 ES RESTO (TOTAL RURAL)
        if ($(this).hasClass("--areaTotal")) {
            filtroArea = 0;
            $("#place__area").text("Todas las clases")
        }
        else if ($(this).hasClass("--cabecera")) {
            filtroArea = 1;
            $("#place__area").text("Cabecera")
        }
        else if ($(this).hasClass("--centroPoblado")) {
            filtroArea = 2;
            $("#place__area").text("Centros poblados")
        }
        else if ($(this).hasClass("--ruralDisperso")) {
            filtroArea = 4;
            $("#place__area").text("Resto rural")
        }
        $(".loader").addClass('--active');
        if ($("#FiltroGeograficoLvl1").val() == "-1") {
            loadEstadisticas(varTema, varSubtema, varVariable)
        }
        else if ($("#FiltroGeograficoLvl2").val() == "-1") {
            loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), null)
        }
        else {
            loadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
        }
    }
})

$("#toolBar__btnFiltrar").click(function () {
    // $(".map__legend img").remove();
    // if(active3DLeft){
    //     active3DLeft = false;
    //     $("#map01").show();

    // }
    // cancelAnimationFrame( idAnimation );
    // $(".loader").addClass('--active');
    // if($("#FiltroGeograficoLvl1").val() == "-1"){
    //     reloadEstadisticas(varTema, varSubtema, varVariable)
    // }
    // else{
    //     if($("#FiltroGeograficoLvl2").val() == "-1"){
    //         reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val())
    //     }
    //     else{
    //         reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
    //     }
    // }
});

$("#functionAnalysis__location").click(function () {
    $(".map__legend img").remove();
});

$("#functionAnalysis__heatmap").click(function () {
    $var.Map.circuloAnalisis.setMap(null);
    $("#toolBar__btnTable").removeClass("--active")
    $("#tablaDatos").remove()
    borrarPoly()
});

//Analisis
$("#toolBar__btnAnalysis").click(function () {
    removeCapas();
    if ($var.Map.visualMarkers.length > 0) {
        $var.Map.delVisualMarkers($var.Map.visualMarkers);
        $var.Map.visualMarkers = [];
        $var.Map.circuloAnalisis.setMap(null);
    }
    var marker = new google.maps.Marker({
        position: $var.Map.map.getCenter(),
        icon: $var.Map.daneMarker,
        map: $var.Map.map,
        draggable: true
    });
    $var.Map.visualMarkers.push(marker);
    $var.Map.map.setZoom(13);
    google.maps.event.addListener(marker, "dragend", function (e) {
        $var.Map.circuloAnalisis.setCenter(e.latLng);
    })

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
})

//3D Map
$("#toolBar__btn3D").click(function () {
    if (active3D) {
        active3D = false;
        $("#map01").hide();
        $(".map__box05").removeClass("--active");
        $('#ActionBar__Perspective__btn').removeClass('--active');
    }
    if (!active3DLeft) {
        // removeCapas();
        active3DLeft = true;
        $("#map01").hide();
        $(".map__box06").addClass("--active");
        loadMapa3D();
        $("#3Dmap").on('mousemove', onDocumentMouseMove);
    }
})

$("#close_polygon").click(function () {
    cerrarPoly()
})

$("#delete_polygon").click(function () {
    borrarPoly()
})

$(".functionAnalysis__slideTrans__scrollBtn.analysis").on("mousedown", function (e) {
    e.stopPropagation();
    movingOpacity = true;
    var thisBtn = this;
    var percentage = 0;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    d3.select(".tooltip").remove();
    div = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    function onMouseMove(e) {
        var minLeft = $(thisBtn).parent()[0].getBoundingClientRect().left;
        newLeft = e.clientX - minLeft;
        percentage = newLeft / $(thisBtn).parent().width();
        if (newLeft < 0) {
            newLeft = 0;
            percentage = 0;
        }
        var rightEdge = $(thisBtn).parent().width();
        if (newLeft > rightEdge) {
            newLeft = rightEdge;
            percentage = 1;
        }
        percentage = 20000 * percentage;
        $(thisBtn).css("left", newLeft + "px")

        div.selectAll("text").remove();
        div.append("text")
            .html(Math.round(percentage).toLocaleString("de-De") + " metros");
        div.style("left", (e.clientX - $(".tooltip").width() / 2) + "px")
            .style("top", (e.clientY - 40) + "px");
    }

    function onMouseUp() {
        // c(percentage)
        $var.Map.radius = percentage;
        div.remove();
        $var.Map.circuloAnalisis.setRadius(percentage);
        $var.Map.map.fitBounds($var.Map.circuloAnalisis.getBounds());
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
        e.stopPropagation();
    }
})

$(".functionAnalysis__slideTrans__scrollBtn.heatMap").on("mousedown", function (e) {
    e.stopPropagation();
    movingOpacity = true;
    var thisBtn = this;
    var percentage = 0;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    d3.select(".tooltip").remove();
    div = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    function onMouseMove(e) {
        var minLeft = $(thisBtn).parent()[0].getBoundingClientRect().left;
        newLeft = e.clientX - minLeft;
        heatIntensity = newLeft / $(thisBtn).parent().width();
        if (newLeft < 0) {
            newLeft = 0;
            heatIntensity = 0;
        }
        var rightEdge = $(thisBtn).parent().width();
        if (newLeft > rightEdge) {
            newLeft = rightEdge;
            heatIntensity = 1;
        }
        heatIntensity = 10 + ((5000 - 10) * heatIntensity);
        $(thisBtn).css("left", newLeft + "px")

        div.selectAll("text").remove();
        div.append("text")
            .html(Math.round(heatIntensity).toLocaleString("de-De") + " " + $(".functionAnalysis__boxDescription__text__bold .functionAnalysis__slideTrans__textValue__legend").text());
        div.style("left", (e.clientX - $(".tooltip").width() / 2) + "px")
            .style("top", (e.clientY - 40) + "px");
    }

    function onMouseUp() {
        div.remove();
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
        e.stopPropagation();
    }
})

$(".functionAnalysis__btn").on("click", function () {
    realizarEstadisticas();
})

$(".functionAnalysis__btn_heatMap").on("click", function () {
    cargarMapaCalor();
})

$("#btn_printModal").on("click", function () {
    printResults();
})

$(".toolBar__container__panel__functionBox__BaseMapList__slideTrans__scrollBtn").on("mousedown", function (e) {
    e.stopPropagation();
    var thisBtn = this;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    function onMouseMove(e) {
        var minLeft = $(thisBtn).parent()[0].getBoundingClientRect().left;
        newLeft = e.clientX - minLeft;
        percentage = newLeft / $(thisBtn).parent().width();
        if (newLeft < 0) {
            newLeft = 0;
            percentage = 0;
        }
        var rightEdge = $(thisBtn).parent().width();
        if (newLeft > rightEdge) {
            newLeft = rightEdge;
            percentage = 1;
        }
        percentage = 1 - percentage;
        $(thisBtn).css("left", newLeft + "px")
    }

    function onMouseUp() {
        if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__gris") {
            if ($("#function__darkMode").val() == 2) {
                $var.Map.baseMaps.noche.setOpacity(percentage);
                if ($var.Map.base3DMaps.noche) {
                    $var.Map.base3DMaps.noche.setOpacity(percentage);
                }
            }
            else {
                $var.Map.baseMaps.gris.setOpacity(percentage);
                if ($var.Map.base3DMaps.gris) {
                    $var.Map.base3DMaps.gris.setOpacity(percentage);
                }
            }
        }
        else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__topografico") {
            $var.Map.baseMaps.topografico.setOpacity(percentage);
            $var.Map.base3DMaps.topografico.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__satelital") {
            $var.Map.baseMaps.satelital.setOpacity(percentage);
            $var.Map.base3DMaps.satelital.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__hibrido") {
            $var.Map.baseMaps.hybrid.setOpacity(percentage);
            $var.Map.base3DMaps.hybrid.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__OSM") {
            $var.Map.baseMaps.osm.setOpacity(percentage);
            $var.Map.base3DMaps.osm.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__terreno") {
            $var.Map.baseMaps.terrain.setOpacity(percentage);
            $var.Map.base3DMaps.terrain.setOpacity(percentage);
        }
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
    }
})

$(".toolBar__container__panel__functionBox__BaseMapList__slideTrans__scrollBar").on("mousedown", function (e) {
    e.stopPropagation();
    var thisBtn = $(this).find(".toolBar__container__panel__functionBox__BaseMapList__slideTrans__scrollBtn");
    var minLeft = $(this)[0].getBoundingClientRect().left;
    newLeft = e.clientX - minLeft;
    percentage = newLeft / $(this).width();
    if (newLeft < 0) {
        newLeft = 0;
        percentage = 0;
    }
    var rightEdge = $(this).width();
    if (newLeft > rightEdge) {
        newLeft = rightEdge;
        percentage = 1;
    }
    percentage = 1 - percentage;
    thisBtn.css("left", newLeft + "px")

    if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__gris") {
        if ($("#function__darkMode").val() == 2) {
            $var.Map.baseMaps.noche.setOpacity(percentage);
            if ($var.Map.base3DMaps.noche) {
                $var.Map.base3DMaps.noche.setOpacity(percentage);
            }
        }
        else {
            $var.Map.baseMaps.gris.setOpacity(percentage);
            if ($var.Map.base3DMaps.gris) {
                $var.Map.base3DMaps.gris.setOpacity(percentage);
            }
        }
    }
    else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__topografico") {
        $var.Map.baseMaps.topografico.setOpacity(percentage);
        $var.Map.base3DMaps.topografico.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__satelital") {
        $var.Map.baseMaps.satelital.setOpacity(percentage);
        $var.Map.base3DMaps.satelital.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__hibrido") {
        $var.Map.baseMaps.hybrid.setOpacity(percentage);
        $var.Map.base3DMaps.hybrid.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__OSM") {
        $var.Map.baseMaps.osm.setOpacity(percentage);
        $var.Map.base3DMaps.osm.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__terreno") {
        $var.Map.baseMaps.terrain.setOpacity(percentage);
        $var.Map.base3DMaps.terrain.setOpacity(percentage);
    }

});

//Evento para dispositivos móviles
$(".toolBar__container__panel__functionBox__BaseMapList__slideTrans__scrollBtn").on("touchstart", function (e) {
    e.stopPropagation();
    e.preventDefault();
    var thisBtn = this;
    document.addEventListener('touchmove', onMouseMove);
    document.addEventListener('touchend', onMouseUp);

    function onMouseMove(e) {
        var touch = e.touches[0];
        var minLeft = $(thisBtn).parent()[0].getBoundingClientRect().left;
        newLeft = touch.clientX - minLeft;
        percentage = newLeft / $(thisBtn).parent().width();
        if (newLeft < 0) {
            newLeft = 0;
            percentage = 0;
        }
        var rightEdge = $(thisBtn).parent().width();
        if (newLeft > rightEdge) {
            newLeft = rightEdge;
            percentage = 1;
        }
        percentage = 1 - percentage;
        $(thisBtn).css("left", newLeft + "px")
    }

    function onMouseUp() {
        if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__gris") {
            if ($("#function__darkMode").val() == 2) {
                $var.Map.baseMaps.noche.setOpacity(percentage);
                if ($var.Map.base3DMaps.noche) {
                    $var.Map.base3DMaps.noche.setOpacity(percentage);
                }
            }
            else {
                $var.Map.baseMaps.gris.setOpacity(percentage);
                if ($var.Map.base3DMaps.gris) {
                    $var.Map.base3DMaps.gris.setOpacity(percentage);
                }
            }
        }
        else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__topografico") {
            $var.Map.baseMaps.topografico.setOpacity(percentage);
            $var.Map.base3DMaps.topografico.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__satelital") {
            $var.Map.baseMaps.satelital.setOpacity(percentage);
            $var.Map.base3DMaps.satelital.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__hibrido") {
            $var.Map.baseMaps.hybrid.setOpacity(percentage);
            $var.Map.base3DMaps.hybrid.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__OSM") {
            $var.Map.baseMaps.osm.setOpacity(percentage);
            $var.Map.base3DMaps.osm.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__terreno") {
            $var.Map.baseMaps.terrain.setOpacity(percentage);
            $var.Map.base3DMaps.terrain.setOpacity(percentage);
        }
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
    }
})

$(".toolBar__container__panel__functionBox__BaseMapList__slideTrans__scrollBar").on("touchstart", function (e) {
    e.stopPropagation();
    var thisBtn = $(this).find(".toolBar__container__panel__functionBox__BaseMapList__slideTrans__scrollBtn");
    var touch = e.originalEvent.targetTouches[0];
    var minLeft = $(this)[0].getBoundingClientRect().left;
    newLeft = touch.clientX - minLeft;
    percentage = newLeft / $(this).width();
    if (newLeft < 0) {
        newLeft = 0;
        percentage = 0;
    }
    var rightEdge = $(this).width();
    if (newLeft > rightEdge) {
        newLeft = rightEdge;
        percentage = 1;
    }
    percentage = 1 - percentage;
    thisBtn.css("left", newLeft + "px")

    if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__gris") {
        if ($("#function__darkMode").val() == 2) {
            $var.Map.baseMaps.noche.setOpacity(percentage);
            if ($var.Map.base3DMaps.noche) {
                $var.Map.base3DMaps.noche.setOpacity(percentage);
            }
        }
        else {
            $var.Map.baseMaps.gris.setOpacity(percentage);
            if ($var.Map.base3DMaps.gris) {
                $var.Map.base3DMaps.gris.setOpacity(percentage);
            }
        }
    }
    else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__topografico") {
        $var.Map.baseMaps.topografico.setOpacity(percentage);
        $var.Map.base3DMaps.topografico.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__satelital") {
        $var.Map.baseMaps.satelital.setOpacity(percentage);
        $var.Map.base3DMaps.satelital.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__hibrido") {
        $var.Map.baseMaps.hybrid.setOpacity(percentage);
        $var.Map.base3DMaps.hybrid.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__OSM") {
        $var.Map.baseMaps.osm.setOpacity(percentage);
        $var.Map.base3DMaps.osm.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").find(".toolBar__container__panel__functionBox__BaseMapList__item__btn").attr("id") == "BaseMapList__terreno") {
        $var.Map.baseMaps.terrain.setOpacity(percentage);
        $var.Map.base3DMaps.terrain.setOpacity(percentage);
    }

});



$(".toolBar__Container__panel__functionBox__checkList__item__slideTrans__scrollBtn").on("mousedown", function (e) {
    e.stopPropagation();
    movingOpacity = true;
    var thisBtn = this;
    var percentage = 0;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    function onMouseMove(e) {
        var minLeft = $(thisBtn).parent()[0].getBoundingClientRect().left;
        newLeft = e.clientX - minLeft;
        percentage = newLeft / $(thisBtn).parent().width();
        if (newLeft < 0) {
            newLeft = 0;
            percentage = 0;
        }
        var rightEdge = $(thisBtn).parent().width();
        if (newLeft > rightEdge) {
            newLeft = rightEdge;
            percentage = 1;
        }
        percentage = 1 - percentage;
        $(thisBtn).css("left", newLeft + "px")
    }

    function onMouseUp() {
        if ($(thisBtn).parents("li").hasClass("--ResguardosIndigenas")) {
            $var.Map.layers.resguardos.setOpacity(percentage);
            $var.Map.layers3D.resguardos.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").hasClass("--Parques")) {
            $var.Map.layers.pnn.setOpacity(percentage);
            $var.Map.layers3D.pnn.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").hasClass("--ConsejosComunitariosNegros")) {
            $var.Map.layers.consejos.setOpacity(percentage);
            $var.Map.layers3D.consejos.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").hasClass("--ZonasDeReservaCampesina")) {
            $var.Map.layers.campesinos.setOpacity(percentage);
            $var.Map.layers3D.campesinos.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").hasClass("--Veredas")) {
            $var.Map.layers.veredas.setOpacity(percentage);
            $var.Map.layers3D.veredas.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").hasClass("--uploadLayer")) {
            $("#map").find("img[src*='kml']").css("opacity", percentage);
            if ($var.Map.map.overlayMapTypes.getAt(0) != undefined) {
                $var.Map.map.overlayMapTypes.getAt(0).setOpacity(percentage)
            }
        }
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
        e.stopPropagation();
    }
})

$(".toolBar__Container__panel__functionBox__checkList__item__slideTrans__scrollBar").on("mousedown", function (e) {
    e.stopPropagation();
    var thisBtn = $(this).find(".toolBar__Container__panel__functionBox__checkList__item__slideTrans__scrollBtn");
    var minLeft = $(this)[0].getBoundingClientRect().left;
    newLeft = e.clientX - minLeft;
    percentage = newLeft / $(this).width();
    if (newLeft < 0) {
        newLeft = 0;
        percentage = 0;
    }
    var rightEdge = $(this).width();
    if (newLeft > rightEdge) {
        newLeft = rightEdge;
        percentage = 1;
    }
    percentage = 1 - percentage;
    thisBtn.css("left", newLeft + "px")


    if ($(thisBtn).parents("li").hasClass("--ResguardosIndigenas")) {
        $var.Map.layers.resguardos.setOpacity(percentage);
        $var.Map.layers3D.resguardos.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").hasClass("--Parques")) {
        $var.Map.layers.pnn.setOpacity(percentage);
        $var.Map.layers3D.pnn.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").hasClass("--ConsejosComunitariosNegros")) {
        $var.Map.layers.consejos.setOpacity(percentage);
        $var.Map.layers3D.consejos.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").hasClass("--ZonasDeReservaCampesina")) {
        $var.Map.layers.campesinos.setOpacity(percentage);
        $var.Map.layers3D.campesinos.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").hasClass("--Veredas")) {
        $var.Map.layers.veredas.setOpacity(percentage);
        $var.Map.layers3D.veredas.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").hasClass("--uploadLayer")) {
        $("#map").find("img[src*='kml']").css("opacity", percentage);
        if ($var.Map.map.overlayMapTypes.getAt(0) != undefined) {
            $var.Map.map.overlayMapTypes.getAt(0).setOpacity(percentage)
        }
    }
})


//Evento para dispositivos móviles
$(".toolBar__Container__panel__functionBox__checkList__item__slideTrans__scrollBtn").on("touchstart", function (e) {
    e.stopPropagation();
    e.preventDefault();
    var thisBtn = this;
    document.addEventListener('touchmove', onMouseMove);
    document.addEventListener('touchend', onMouseUp);

    function onMouseMove(e) {
        var touch = e.touches[0];
        var minLeft = $(thisBtn).parent()[0].getBoundingClientRect().left;
        newLeft = touch.clientX - minLeft;
        percentage = newLeft / $(thisBtn).parent().width();
        if (newLeft < 0) {
            newLeft = 0;
            percentage = 0;
        }
        var rightEdge = $(thisBtn).parent().width();
        if (newLeft > rightEdge) {
            newLeft = rightEdge;
            percentage = 1;
        }
        percentage = 1 - percentage;
        $(thisBtn).css("left", newLeft + "px")
    }

    function onMouseUp() {
        if ($(thisBtn).parents("li").hasClass("--ResguardosIndigenas")) {
            $var.Map.layers.resguardos.setOpacity(percentage);
            $var.Map.layers3D.resguardos.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").hasClass("--Parques")) {
            $var.Map.layers.pnn.setOpacity(percentage);
            $var.Map.layers3D.pnn.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").hasClass("--ConsejosComunitariosNegros")) {
            $var.Map.layers.consejos.setOpacity(percentage);
            $var.Map.layers3D.consejos.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").hasClass("--ZonasDeReservaCampesina")) {
            $var.Map.layers.campesinos.setOpacity(percentage);
            $var.Map.layers3D.campesinos.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").hasClass("--Veredas")) {
            $var.Map.layers.veredas.setOpacity(percentage);
            $var.Map.layers3D.veredas.setOpacity(percentage);
        }
        else if ($(thisBtn).parents("li").hasClass("--uploadLayer")) {
            $("#map").find("img[src*='kml']").css("opacity", percentage);
            if ($var.Map.map.overlayMapTypes.getAt(0) != undefined) {
                $var.Map.map.overlayMapTypes.getAt(0).setOpacity(percentage)
            }
        }
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
    }
})

$(".toolBar__Container__panel__functionBox__checkList__item__slideTrans__scrollBar").on("touchstart", function (e) {
    e.stopPropagation();
    var thisBtn = $(this).find(".toolBar__Container__panel__functionBox__checkList__item__slideTrans__scrollBtn");
    var touch = e.originalEvent.targetTouches[0];
    var minLeft = $(this)[0].getBoundingClientRect().left;
    newLeft = touch.clientX - minLeft;
    percentage = newLeft / $(this).width();
    if (newLeft < 0) {
        newLeft = 0;
        percentage = 0;
    }
    var rightEdge = $(this).width();
    if (newLeft > rightEdge) {
        newLeft = rightEdge;
        percentage = 1;
    }
    percentage = 1 - percentage;
    thisBtn.css("left", newLeft + "px")

    if ($(thisBtn).parents("li").hasClass("--ResguardosIndigenas")) {
        $var.Map.layers.resguardos.setOpacity(percentage);
        $var.Map.layers3D.resguardos.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").hasClass("--Parques")) {
        $var.Map.layers.pnn.setOpacity(percentage);
        $var.Map.layers3D.pnn.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").hasClass("--ConsejosComunitariosNegros")) {
        $var.Map.layers.consejos.setOpacity(percentage);
        $var.Map.layers3D.consejos.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").hasClass("--ZonasDeReservaCampesina")) {
        $var.Map.layers.campesinos.setOpacity(percentage);
        $var.Map.layers3D.campesinos.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").hasClass("--Veredas")) {
        $var.Map.layers.veredas.setOpacity(percentage);
        $var.Map.layers3D.veredas.setOpacity(percentage);
    }
    else if ($(thisBtn).parents("li").hasClass("--uploadLayer")) {
        $("#map").find("img[src*='kml']").css("opacity", percentage);
        if ($var.Map.map.overlayMapTypes.getAt(0) != undefined) {
            $var.Map.map.overlayMapTypes.getAt(0).setOpacity(percentage)
        }
    }

});

$(".map__transparency__slideTrans__scrollBar").on("mousedown", function (e) {
    e.stopPropagation();
    var thisBtn = $(".map__transparency__slideTrans__scrollBtn");
    var minLeft = $(this)[0].getBoundingClientRect().left;
    newLeft = e.clientX - minLeft;
    percentageMapOpacity = newLeft / $(this).parent().width();
    if (newLeft < 0) {
        newLeft = 0;
        percentageMapOpacity = 0;
    }
    var rightEdge = $(this).width();
    if (newLeft > rightEdge) {
        newLeft = rightEdge;
        percentageMapOpacity = 1;
    }
    percentageMapOpacity = 1 - percentageMapOpacity;
    thisBtn.css("left", newLeft + "px")

    $var.Map.layers.layerDatos.forEach(function (d) {
        $var.Map.layers.layerDatos.overrideStyle(d, { fillOpacity: percentageMapOpacity, strokeOpacity: percentageMapOpacity })
    })

    $var.Map.layers3D.layerDatos.setOpacity(percentageMapOpacity);

    for (var a = 0; a < arrayCirculos.length; a++) {
        arrayCirculos[a].setOptions({ fillOpacity: percentageMapOpacity });
    }

    if (active3DLeft) {
        if ($(".function3D__container__switch__content__input").is(":checked")) {
            updateMeshes()
        }
        else {
            updateMeshes(1)
        }
    }
});

$(".map__transparency__slideTrans__scrollBtn").on("mousedown", function (e) {
    e.stopPropagation();
    movingOpacity = true;
    var thisBtn = this;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    function onMouseMove(e) {
        var minLeft = $(thisBtn).parent()[0].getBoundingClientRect().left;
        newLeft = e.clientX - minLeft;
        percentageMapOpacity = newLeft / $(thisBtn).parent().width();
        if (newLeft < 0) {
            newLeft = 0;
            percentageMapOpacity = 0;
        }
        var rightEdge = $(thisBtn).parent().width();
        if (newLeft > rightEdge) {
            newLeft = rightEdge;
            percentageMapOpacity = 1;
        }
        percentageMapOpacity = 1 - percentageMapOpacity;
        $(thisBtn).css("left", newLeft + "px")
    }

    function onMouseUp() {
        $var.Map.layers.layerDatos.forEach(function (d) {
            $var.Map.layers.layerDatos.overrideStyle(d, { fillOpacity: percentageMapOpacity, strokeOpacity: percentageMapOpacity })
        })

        $var.Map.layers3D.layerDatos.setOpacity(percentageMapOpacity);

        for (var a = 0; a < arrayCirculos.length; a++) {
            arrayCirculos[a].setOptions({ fillOpacity: percentageMapOpacity });
        }
        if (active3DLeft) {
            if ($(".function3D__container__switch__content__input").is(":checked")) {
                updateMeshes()
            }
            else {
                updateMeshes(1)
            }
        }

        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
        e.stopPropagation();
    }
});

// //Evento para dispositivos móviles
$(".map__transparency__slideTrans__scrollBar").on("touchstart", function (e) {
    e.stopPropagation();
    var thisBtn = $(".map__transparency__slideTrans__scrollBtn");
    var touch = e.originalEvent.targetTouches[0];
    var minLeft = $(this)[0].getBoundingClientRect().left;
    newLeft = touch.clientX - minLeft;
    percentageMapOpacity = newLeft / $(this).parent().width();
    if (newLeft < 0) {
        newLeft = 0;
        percentageMapOpacity = 0;
    }
    var rightEdge = $(this).width();
    if (newLeft > rightEdge) {
        newLeft = rightEdge;
        percentageMapOpacity = 1;
    }
    percentageMapOpacity = 1 - percentageMapOpacity;
    thisBtn.css("left", newLeft + "px")

    $var.Map.layers.layerDatos.forEach(function (d) {
        $var.Map.layers.layerDatos.overrideStyle(d, { fillOpacity: percentageMapOpacity, strokeOpacity: percentageMapOpacity })
    })

    $var.Map.layers3D.layerDatos.setOpacity(percentageMapOpacity);

    for (var a = 0; a < arrayCirculos.length; a++) {
        arrayCirculos[a].setOptions({ fillOpacity: percentageMapOpacity });
    }

    if (active3DLeft) {
        if ($(".function3D__container__switch__content__input").is(":checked")) {
            updateMeshes()
        }
        else {
            updateMeshes(1)
        }
    }
});

$(".map__transparency__slideTrans__scrollBtn").on("touchstart", function (e) {
    e.stopPropagation();
    e.preventDefault();
    movingOpacity = true;
    var thisBtn = this;
    var percentageMapOpacity = 0;
    document.addEventListener('touchmove', onMouseMove);
    document.addEventListener('touchend', onMouseUp);

    function onMouseMove(e) {
        var touch = e.touches[0];
        var minLeft = $(thisBtn).parent()[0].getBoundingClientRect().left;
        newLeft = touch.clientX - minLeft;
        percentageMapOpacity = newLeft / $(thisBtn).parent().width();
        if (newLeft < 0) {
            newLeft = 0;
            percentageMapOpacity = 0;
        }
        var rightEdge = $(thisBtn).parent().width();
        if (newLeft > rightEdge) {
            newLeft = rightEdge;
            percentageMapOpacity = 1;
        }
        percentageMapOpacity = 1 - percentageMapOpacity;
        $(thisBtn).css("left", newLeft + "px")
    }

    function onMouseUp() {
        $var.Map.layers.layerDatos.forEach(function (d) {
            $var.Map.layers.layerDatos.overrideStyle(d, { fillOpacity: percentageMapOpacity, strokeOpacity: percentageMapOpacity })
        })

        $var.Map.layers3D.layerDatos.setOpacity(percentageMapOpacity);

        for (var a = 0; a < arrayCirculos.length; a++) {
            arrayCirculos[a].setOptions({ fillOpacity: percentageMapOpacity });
        }

        if (active3DLeft) {
            if ($(".function3D__container__switch__content__input").is(":checked")) {
                updateMeshes()
            }
            else {
                updateMeshes(1)
            }
        }

        document.removeEventListener('touchend', onMouseUp);
        document.removeEventListener('touchmove', onMouseMove);
        e.stopPropagation();
    }
});

$(".results__panel__selectGraph__principalList").on("click", function () {
    if ($(this).parent().hasClass("--active")) {
        if (($(this).find("li.--active").attr("id") == "selectGraphs__bars")) {
            loadBarsH(datosGraficos)
        }
        else if (($(this).find("li.--active").attr("id") == "selectGraphs__bars_v")) {
            loadBarsV(datosGraficos)
        }
        else if (($(this).find("li.--active").attr("id") == "selectGraphs__cake")) {
            loadPie(datosGraficos)
        }
        else if (($(this).find("li.--active").attr("id") == "selectGraphs__Line")) {
            loadLine(datosGraficos)
        }
        else if (($(this).find("li.--active").attr("id") == "selectGraphs__donut")) {
            loadDona(datosGraficos)
        }
        //TODO OTHERS GRAPHS
    }
});

//Mapas base
function layersPrint(){
    $.ajax({
        url:"https://geoportal.dane.gov.co/laboratorio/serviciosjson/visores/mapasbase.php?nivel_mapabase=1",
        type:"GET",
        success: function(data){
            $.each(data.resultado, function (key, value) {
                var ul = $('.toolBar__container__panel__functionBox__BaseMapList');
                var liTemp = ul.find('li:first').clone(true);
                liTemp.addClass(value["CLASE"]).attr('id', value["CLASE"]).removeClass("--invisible");
                var liDivTemp = liTemp.children(".toolBar__container__panel__functionBox__BaseMapList__item__btn");
                liTemp.find(".toolBar__container__panel__functionBox__BaseMapList__item__btn__imageBox__image").attr('title','Geoportal DANE - '+value["NOMBRE"]).attr('alt','Geoportal DANE - '+value["NOMBRE"]).attr('src', value["IMAGEN_ENLACE"]);
                liDivTemp.find(".toolBar__container__panel__functionBox__BaseMapList__item__btn__name").text(value["NOMBRE"]);               
                liTemp.appendTo(ul);
            });
            $('.basemap__gris').addClass('--active');
        }
    });
}
$(".toolBar__container__panel__functionBox__BaseMapList__item").on("click", function(){    
    $(".toolBar__container__panel__functionBox__BaseMapList__item").removeClass("--active");
    if($(this).attr("id") == "BaseMapList__3D"){
        loadToner();
        $(this).addClass("--active");
    }
    else if($(this).attr("id") == "basemap__satelital"){
        loadSatelital();
        $(this).addClass("--active");
    }
    else if($(this).attr("id") == "basemap__hibrido"){
        loadHibrido();
        $(this).addClass("--active");
    }
    else if($(this).attr("id") == "basemap__osm"){
        loadOSM();
        $(this).addClass("--active");
    }
    else if($(this).attr("id") == "basemap__terreno"){
        loadTerreno();
        $(this).addClass("--active");
    }
    else if($(this).attr("id") == "basemap__noche"){
        loadNoche();
        $(this).addClass("--active");
    }
    else if($(this).attr("id") == "basemap__gris"){
        loadGris();
        $(this).addClass("--active");
    }
})

//Medida
$("#Measure__erase").on("click", function () {
    $var.Map.map.setOptions({ draggableCursor: 'url(https://maps.gstatic.com/mapfiles/openhand_8_8.cur),default' });
    borrarMedida()
})

$("#measure__step01 .toolBar__container__panel__functionBox__step__btnList__item__button").on("click", function () {
    borrarMedida()
    $('#ActionBar__identify__btn').removeClass("--active");
    $var.Map.clickableLayer = false;
    $(".toolBar__container__panel__functionBox__step__btnList__item").removeClass("--active");
    if ($(this).attr("id") == "Measure__button__Distance") {
        isDraw = false;
    }
    else if ($(this).attr("id") == "Measure__button__area") {
        isDraw = false;
    }
    else if ($(this).attr("id") == "Measure__button__draw") {
        isDraw = true;
    }
})

//Load KML/WMS
$(".toolBar__container__panel__functionBox__uploadType__type__upload__selectFile").on("change", function () {
    loadKML();
})

$(".toolBar__container__panel__functionBox__uploadType__type__uploadbtn").on("click", function () {
    $(".--nombreCapaWMS").next().removeClass("--visible")
    $(".--enlaceWMS").next().removeClass("--visible")
    if ($(".--enlaceWMS").val() != "" && $(".--nombreCapaWMS").val() != "") {
        $(".--nombreCapaWMS").next().removeClass("--visible")
        $(".--enlaceWMS").next().removeClass("--visible")
        loadWMS($(".--enlaceWMS").val(), $(".--nombreCapaWMS").val())
    }
    else if ($(".--nombreCapaWMS").val() == "") {
        $(".--nombreCapaWMS").next().addClass("--visible")
        $(".toolBar__container__panel__functionBox__uploadType__type__seeLayer").last().removeClass('--active');
        if ($(".--enlaceWMS").val() == "") {
            $(".--enlaceWMS").next().addClass("--visible")
        }
    }
    else {
        $(".--enlaceWMS").next().addClass("--visible")
        $(".toolBar__container__panel__functionBox__uploadType__type__seeLayer").last().removeClass('--active');
    }
})

$(".toolBar__container__panel__functionBox__checkList__item__deleteLayer").on("click", function () {
    $(".--uploadLayer .toolBar__container__panel__functionBox__checkList__item__text").text("Nombre de la capa cargarda")
    $(".toolBar__container__panel__functionBox__uploadType__type__seeLayer").removeClass('--active');
    $var.Map.map.overlayMapTypes.pop();
    $var.Map.layers.kmlLayer.setMap(null);
    if ($var.Map.layers3D.kmlLayer) {
        $var.Map.layers3D.kmlLayer.remove();
    }
    if (wms3DLayer) {
        wms3DLayer.remove();
    }
})

//3d
$("#ActionBar__Perspective__btn").on("click", function () {
    if (active3DLeft) {
        if (active3D) {
            active3D = false;
            $("#map01").show();
            $(".map__box05").removeClass("--active");
            $('#ActionBar__Perspective__btn').removeClass('--active');
            $(".loader").addClass('--active');
            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                reloadEstadisticas(varTema, varSubtema, varVariable)
            }
            else {
                if ($("#FiltroGeograficoLvl2").val() == "-1") {
                    reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val())
                }
                else {
                    reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
                }
            }
        }
        else {
            active3D = true;
            $("#map01").hide();
            $(".map__box05").addClass("--active");
            $(".toolBar__container__panel__functionBox").removeClass("--visible");
            $(".functionFilter").addClass("--visible");
            $(".toolBar").addClass("--collapse");
        }
        active3DLeft = false;
        cancelAnimationFrame(idAnimation);
        $("#toolBar__btn3D").removeClass("--active");
        $(".map__box06").removeClass("--active");
    }
    else {
        if (active3D) {
            active3D = false;
            $("#map01").show();
            $(".map__box05").removeClass("--active");
            $("#toolBar__btnFiltrar").addClass("--active");
            $('#ActionBar__Perspective__btn').removeClass('--active');
            $(".loader").addClass('--active');
            if ($("#FiltroGeograficoLvl1").val() == "-1") {
                reloadEstadisticas(varTema, varSubtema, varVariable)
            }
            else {
                if ($("#FiltroGeograficoLvl2").val() == "-1") {
                    reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val())
                }
                else {
                    reloadEstadisticas(varTema, varSubtema, varVariable, $("#FiltroGeograficoLvl1").val(), $("#FiltroGeograficoLvl2").val())
                }
            }
        }
        else {
            active3D = true;
            $("#map01").hide();
            $(".map__box05").addClass("--active");
            // c($var.Map.map3D);
        }
    }
})

function basemapPrint() {
    $.ajax({
        url:"https://geoportal.dane.gov.co/laboratorio/serviciosjson/visores/capasreferencia.php?nivel_capa=1",
        type:"GET",
        success: function(data){
            $.each(data.resultado, function (key, value) {
                var ul = $('.toolBar__container__panel__functionBox__checkList');
                var liTemp = ul.find('li:first').clone(true);
                liTemp.addClass(value["CLASE"]).attr('id', value["CLASE"]).removeClass("--invisible");
                var liDivTemp = liTemp.children(".toolBar__container__panel__functionBox__checkList__item__container");
                liTemp.find(".toolBar__container__panel__functionBox__checkList__item__source__text").text(value["FUENTE_TEXTO"]);
                liTemp.find(".toolBar__container__panel__functionBox__checkList__item__source__link").text(value["FUENTE_ENLACE"]).attr('href', value["FUENTE_ENLACE"]);
                liDivTemp.find(".toolBar__container__panel__functionBox__checkList__item__text").text(value["NOMBRE"]);               
                liTemp.appendTo(ul);
            });
        }       
    })
}
//Capas
function capasReferencia(clase,layer,name,funcion){
    // c(clase,layer,name,funcion)
    var checkSelected = ".toolBar__container__panel__functionBox__checkList__item."+clase+"";
    if ($(checkSelected).hasClass(""+clase+"")) {
        if ($(checkSelected).hasClass("--visible")) {
            $(checkSelected).removeClass("--visible");
            var pos = null;
            $var.Map.map.overlayMapTypes.forEach(function (d, i) {
                if (d.name == ""+name+"") {
                    pos = i;
                }
            })
            if (pos != null) {
                $var.Map.map.overlayMapTypes.removeAt(pos)
            }
            $var.Map.layers3D.layer.remove();    
        }
        else {
            $(checkSelected).parent().addClass("--visible");
            $(".loader").addClass('--active');
            eval(funcion+"()");
        }
    }
}
//Capas
$(".toolBar__container__panel__functionBox__checkList__item__container").on("click", function () {                
    var rightEdge = $(".map__transparency__slideTrans__scrollBar").width();
    var newLeft = rightEdge / 2;
    percentageMapOpacity = 0.5;
    $var.Map.layers.layerDatos.forEach(function (d) {
        $var.Map.layers.layerDatos.overrideStyle(d, { fillOpacity: percentageMapOpacity, strokeOpacity: percentageMapOpacity })
    })
    for (var a = 0; a < arrayCirculos.length; a++) {
        arrayCirculos[a].setOptions({ fillOpacity: percentageMapOpacity });
    }
    $(".map__transparency__slideTrans__scrollBtn").css("left", newLeft + "px");
    // capasReferencia(clase,layer,name,funcion)
    // $(this).parent().addClass('--visible');

    if ($(this).parent().hasClass("--ResguardosIndigenas")) {
        capasReferencia($(this).parent().attr("id"),'resguardos',"Resguardos",'loadResguardos');
    }
    else if ($(this).parent().hasClass("--Parques")) {
        capasReferencia($(this).parent().attr("id"),'pnn',"Parques",'loadParques');
    }
    else if ($(this).parent().hasClass("--ConsejosComunitariosNegros")) {
        capasReferencia($(this).parent().attr("id"),'consejos',"Consejos",'loadConsejos');
    }
    else if ($(this).parent().hasClass("--ZonasDeReservaCampesina")) {
        capasReferencia($(this).parent().attr("id"),'campesinos',"Campesina",'loadCampesinos');
    }
    else if ($(this).parent().hasClass("--Veredas")) {
        capasReferencia($(this).parent().attr("id"),'veredas',"Veredas",'loadVeredas');   
    }
    else if ($(this).parent().hasClass("--uploadLayer")) {
        // capasReferencia($(this).parent().attr("id"),'kmlLayer',"UploadLayer",'loadVeredas');
        if ($(this).parent().hasClass("--visible")) {
            $(this).parent().removeClass("--visible");
            var pos = null;
            $var.Map.map.overlayMapTypes.forEach(function (d, i) {
                if (d.name == "UploadLayer") {
                    pos = i;
                }
            })
            if (pos != null) {
                $var.Map.map.overlayMapTypes.removeAt(pos)
            }
            $var.Map.layers.kmlLayer.setMap(null);
            if ($var.Map.layers3D.kmlLayer) {
                $var.Map.layers3D.kmlLayer.remove();
            }
            if (wms3DLayer) {
                wms3DLayer.remove();
            }
        }
        else {
            $(this).parent().addClass("--visible");
            if ($var.Map.layers.kmlLayer) {
                $var.Map.layers.kmlLayer.setMap($var.Map.map);
                $var.Map.layers3D.kmlLayer.addTo($var.Map.map3D);
            }
            if (wmsLayer) {
                $var.Map.map.overlayMapTypes.push(wmsLayer);
                wms3DLayer.addTo($var.Map.map3D);
            }
        }
    }
})

//Tomar foto
$("#PanelBtn__screenShot").on("click", function () {
    if ($(this).attr("id") == "PanelBtn__screenShot") {
        $(".loader").addClass('--active');

        $(".toolBar").addClass("--collapse")
        $(".results").addClass("--collapse")
        $(".functionClose__btn").addClass("--printing")
        $(".map").addClass("--collapseRight").addClass("--collapseLeft")
        $(".gmnoprint").hide();//Quita los controles del mapa
        $(".printMapInfo").css("display", "flex");
        var fecha = fechaActual()
        $(".printMapInfo__date").text(fecha);

        var latitudqr = $var.Map.map.getCenter().lat();
        var longitudqr = $var.Map.map.getCenter().lng();
        latitudqr = latitudqr.toFixed(24);
        longitudqr = longitudqr.toFixed(24);

        geocoder = new google.maps.Geocoder();
        geocoder.geocode({ "latLng": $var.Map.map.getCenter() }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    $("#printMap__longitud").text(latitudqr);
                    $("#printMap__latitud").text(longitudqr);
                    $("#printMap__direccion").text(results[0]["formatted_address"]);

                    if ($("#FiltroGeograficoLvl1").val() == "-1") {
                        $("#printMap__departamento").text("Todos los Departamentos");
                        $("#printMap__municipio").text("Todos los Municipios");
                    }
                    else if ($("#FiltroGeograficoLvl2").val() == "-1") {
                        $("#printMap__departamento").text($("#FiltroGeograficoLvl1 :selected").text());
                        $("#printMap__municipio").text("Todos los Municipios");
                    }
                    else {
                        $("#printMap__departamento").text($("#FiltroGeograficoLvl1 :selected").text());
                        $("#printMap__municipio").text($("#FiltroGeograficoLvl2 :selected").text());
                    }
                    if (filtroArea == 0) {
                        $("#printMap__clase").text("Total");
                    }
                    else if (filtroArea == 1) {
                        $("#printMap__clase").text("Cabecera Municipal");
                    }
                    else {
                        $("#printMap__clase").text("Resto Rural");
                    }
                    $("#printMap__anio").text($("#tiempoAnual").val());

                    var qrcode = new QRCode("printMapInfo__qr_container", {
                        text: "geo:" + latitudqr + ',' + longitudqr,
                        //text: markerLatLngIni,
                        width: 128,
                        height: 128,
                        colorDark: "#AF0451",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });
                    setTimeout(function () {
                        var imagenpng = $('#printMapInfo__qr_container').children('img');
                        var enlaceqr = imagenpng.attr('src'); //Enlace la de la imagen qr
                        // c(enlaceqr)
                        $("#printMapInfo__qr").attr("src", enlaceqr);
                        $('#printMapInfo__qr_container').html('');
                        var s = new XMLSerializer();
                        if (document.querySelector(".map__legend svg")) {
                            var str = s.serializeToString(document.querySelector(".map__legend svg"));
                            canvg(document.getElementById('canvasLeyenda'), str);
                            $("#canvasLeyenda").show()
                            $(".map__legend svg").hide()
                        }

                        if (document.querySelector(".map__legend_2 svg")) {
                            var strSimbolos = s.serializeToString(document.querySelector(".map__legend_2 svg"));
                            canvg(document.getElementById('map__legend__symbol'), strSimbolos);
                            $("#map__legend__symbol").show()
                            $(".map__legend_2 svg").hide()
                        }

                        var heightMap = $(".map").height()
                        var widthMap = heightMap * 1.75011758
                        var heightText = widthMap / 5.183460006
                        var bodyWidth = $("body").width()
                        $("body").width(widthMap)
                        $(".printMapInfo").height(heightText)

                        c(heightMap, widthMap)
                        html2canvas(document.querySelector(".map"), { useCORS: true })
                        .then(function (canvasMap) {
                            html2canvas(document.querySelector(".printMapInfo"), { useCORS: true })
                            .then( function (canvasBar) {
                                var imageMap = canvasMap.toDataURL("image/png");
                                var imageBar = canvasBar.toDataURL("image/png");
                                var doc = new jsPDF('landscape', 'mm', 'letter');   //75 y 25  71.29 96.41
                                doc.addImage(imageMap, 'PNG', 5, 5, 269, 154); //279 216 215.9 × 279.4 1 x 1.291 Pixeles: 2550 x 3300 
                                doc.addImage(imageBar, 'PNG', 5, 159, 269, 52); //24.07 96.41 5.18346001
                                doc.rect(5, 5, 269, 206);
                                doc.save(results[0]["formatted_address"] + '.pdf'); //Guarda el archivo pdf

                                $("body").width(bodyWidth)
                                $("#canvasLeyenda").hide()
                                $("#map__legend__symbol").hide()
                                $(".map__legend svg").show()
                                $(".map__legend_2 svg").show()
                                $(".toolBar").removeClass("--collapse")
                                $(".functionClose__btn").removeClass("--printing")
                                $(".results").removeClass("--collapse")
                                $(".map").removeClass("--collapseRight").removeClass("--collapseLeft")
                                $(".printMapInfo").css("display", "none")
                                $(".loader").removeClass('--active');
                            });
                        });
                    }, 1000);
                }
                else {
                    dir = "No se ha podido obtener ninguna dirección en esas coordenadas.";
                    alert(dir);
                }
            }
        });
    }
    if ($(this).attr("id") == "PanelBtn__Tutorial") {
        $(".Tutorial").removeClass('--invisible');
    }
})

// Evento - Detecta cuando se mueve la barra de zoom y asigna el acercamiento mapa correspondiente
$('.ActionBar__list__item__scrollBar__Arrow').on('mousedown', function (e) {
    e.stopPropagation();
    var thisBtn = this;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Evento - Deteca la posición del cursor y mueve dinamicamente la barra de zoom
    function onMouseMove(e) {
        var minUp = $(thisBtn).parent()[0].getBoundingClientRect().top;
        newUp = e.clientY - minUp;
        if (newUp < 0) {
            newUp = 0;
        }
        var downEdge = $(thisBtn).parent().height();

        if (newUp > downEdge) {
            newUp = downEdge;
        }
        // Posición final de la barra
        $(thisBtn).css("top", newUp + "px")
    }
    function onMouseUp() {
        // Valida la posición en la barra de zoom y asigna el zoom correspondiente
        $var.Map.map.setZoom(getZoomMap(newUp))

        // Elimina los eventos mover mouse y soltar clic 
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
        e.stopPropagation();
    }
});

$(".ActionBar__list__item__scrollBar").on("mousedown", function (e) {
    e.stopPropagation();
    var thisBtn = $(".ActionBar__list__item__scrollBar__Arrow");
    var minUp = $(this)[0].getBoundingClientRect().top;
    newUp = e.clientY - minUp;
    if (newUp < 0) {
        newUp = 0;
    }
    var downEdge = $(this).height();
    if (newUp > downEdge) {
        newUp = downEdge;
    }
    thisBtn.css("top", newUp + "px")

    $var.Map.map.setZoom(getZoomMap(newUp))
});

// Evento para dispositivos móviles - Detecta cuando se mueve la barra de zoom y asigna el acercamiento mapa correspondiente
$('.ActionBar__list__item__scrollBar__Arrow').on('touchstart', function (e) {
    e.stopPropagation();
    e.preventDefault();
    var thisBtn = this;
    document.addEventListener('touchmove', onMouseMove);
    document.addEventListener('touchend', onMouseUp);

    // Evento - Deteca la posición del cursor y mueve dinamicamente la barra de zoom
    function onMouseMove(e) {
        var touch = e.touches[0];
        var minUp = $(thisBtn).parent()[0].getBoundingClientRect().top;
        newUp = touch.clientY - minUp;
        if (newUp < 0) {
            newUp = 0;
        }
        var downEdge = $(thisBtn).parent().height();

        if (newUp > downEdge) {
            newUp = downEdge;
        }
        // Posición final de la barra
        $(thisBtn).css("top", newUp + "px")
    }
    function onMouseUp() {
        // Valida la posición en la barra de zoom y asigna el zoom correspondiente
        $var.Map.map.setZoom(getZoomMap(newUp))

        // Elimina los eventos mover mouse y soltar clic 
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
        e.stopPropagation();
    }
});

$(".ActionBar__list__item__scrollBar").on("mousedown", function (e) {
    e.stopPropagation();
    var thisBtn = $(".ActionBar__list__item__scrollBar__Arrow");
    var touch = e.originalEvent.targetTouches[0];
    var minUp = $(this)[0].getBoundingClientRect().top;
    newUp = touch.clientY - minUp;
    if (newUp < 0) {
        newUp = 0;
    }
    var downEdge = $(this).height();
    if (newUp > downEdge) {
        newUp = downEdge;
    }
    thisBtn.css("top", newUp + "px")

    $var.Map.map.setZoom(getZoomMap(newUp))
});

$var.Map.loadUrlParameters = function () {
    if (urlGet.search != "" && urlGet.searchParams.get("bm") != null) {
        if (urlGet.searchParams.get("bm") == "st") {
            loadSatelital();
            $("#basemap__satelital").parent().addClass("--active")
        }
        else if (urlGet.searchParams.get("bm") == "hb") {
            loadHibrido();
            $("#basemap__hibrido").parent().addClass("--active")
        }
        else if (urlGet.searchParams.get("bm") == "osm") {
            loadOSM();
            $("#basemap__osm").parent().addClass("--active")
        }
        else if (urlGet.searchParams.get("bm") == "tr") {
            loadTerreno();
            $("#basemap__terreno").parent().addClass("--active")
        }
        else if (urlGet.searchParams.get("bm") == "gs") {
            loadGris();
            $("#basemap__gris").parent().addClass("--active")
        }
    }
    if (urlGet.search != "" && urlGet.searchParams.get("cv") != null) {
        codigoVisor = urlGet.searchParams.get("cv");
    }

}

$('.functionFilter__thematicGroup__more').click(function (e) {
    e.stopPropagation();
    $('.--filtros').toggleClass('--visibleGroupPrincipal');
});

$(document).ready(function () {
    $(".functionPalette__container__switch__contentSwitch.--type01").click(function(e){
        e.preventDefault();
        $("body").addClass("--blackboard").removeClass("--whiteboard");
        loadNoche();
        $(".functionPalette__container__switch__contentSwitch.--type02").removeClass("--invisible");
        $(this).addClass('--invisible');          
    });
    $(".functionPalette__container__switch__contentSwitch.--type02").click(function(e){
        e.preventDefault();
        $("body").removeClass("--blackboard").addClass("--whiteboard");
        loadGris();
        $(".functionPalette__container__switch__contentSwitch.--type01").removeClass("--invisible");
        $(this).addClass('--invisible');          
    });

    

    $var.Map.loadUrlParameters();
    if (urlGet.search != "" && urlGet.searchParams.get("cv") != null) {
        codigoVisor = urlGet.searchParams.get("cv");
    }
    loadTematicas()
    $(".loader").addClass('--active');
    $(".functionPalette__paletteList__color").hide();
    $(".c0").show();
    $(".c2").show();
    $(".c4").show();
    $(".c6").show();
    $(".c8").show();
    loadDivipola();
    basemapPrint();
    layersPrint();
    $var.Map.map.addListener('zoom_changed', function () {
        if (filtroArea == "1" || filtroArea == "2" || $("#functionPalette__maptype").val() == "1") {
            var arrayDatos = []
            for (var a = 0; a < arrayCirculos.length; a++) {
                if ($("#FiltroGeograficoLvl1").val() == "-1") {
                    arrayDatos.push(parseFloat(getValorPorcentaje(arrayCirculos[a].variable, arrayCirculos[a].codigo)))
                }
                else {
                    arrayDatos.push(parseFloat(getValorPorcentaje(arrayCirculos[a].variable, arrayCirculos[a].codigo2)))
                }
            }
            var max = d3.max(arrayDatos)
            var min = d3.min(arrayDatos)

            var metersPerPx = 156543.03392 * Math.cos($var.Map.map.getCenter().lat() * Math.PI / 180) / Math.pow(2, $var.Map.map.getZoom())

            var radius = d3.scale.linear().domain([min, max]).range([10 * metersPerPx, 60 * metersPerPx]);
            loadLeyendaCirculos(datosMapa)

            for (var a = 0; a < arrayCirculos.length; a++) {
                if ($("#FiltroGeograficoLvl1").val() == "-1") {
                    arrayCirculos[a].setRadius(radius(parseFloat(getValorPorcentaje(arrayCirculos[a].variable, arrayCirculos[a].codigo))))
                }
                else {
                    arrayCirculos[a].setRadius(radius(parseFloat(getValorPorcentaje(arrayCirculos[a].variable, arrayCirculos[a].codigo2))))
                }
            }
        }
    });
});

