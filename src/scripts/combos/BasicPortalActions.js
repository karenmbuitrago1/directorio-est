var $jq = require("jquery");
var cookie = require("js-cookie");
var fontsize = 1;
function initBasicActions() {
    panel();
    toolBar();
    table();
    modal();
    accordion();
    filterMenu();
    functionUploadButtons();
    checkAction();
    radioAction();
    measureFilter();
    analysis();
    responsive();
    selectGraph();
    tutorialMeasure();
    resultsScroll();
    palette();
    resizeLeft();
    resizeRight();
    accesibility();
}
function accesibility() {

    $('.--letterIncrease').on("click", function () {
        var fontsize = parseFloat($('body').css('font-size'));
        fontsize = fontsize + 1;
        if (fontsize >= 20) {
            fontsize = fontsize;
        } else {
            $("body").css({ "font-size": fontsize + "px" });
        }
    });
    $('.--letterDecrease').on("click", function () {
        var fontsize = parseFloat($('body').css('font-size'));
        fontsize = fontsize - 1;
        if (fontsize <= 10) {
            fontsize = fontsize;
            // $("body").removeAttr("style");
        } else {
            $("body").css({ "font-size": fontsize + "px" });
        }
    });
    $('.--color').on("click", function () {
        $("body").toggleClass('--grayscale');

    });

    $('.accesibility__btn').on("click", function () {
        $(".Header__container__textBox").toggleClass("--accesibilityNewWidth");
        $(".accesibility").toggleClass("--visible");
    });
    //responsive
    //if ($(window).width() < 1300) {
    //  $(".accessibility").removeClass("--visible");
    //}

}
function panel() {
    //Ocultar panel//
    $(".toolBar__collapseBtn").click(function () {
        $(".toolBar").toggleClass("--collapse").removeAttr("style");
        $(".map").toggleClass("--collapseLeft");
    });
    $(".Header__menu").click(function(){
        $(".toolBar").toggleClass("--collapse").removeAttr("style");
        $(this).toggleClass("--active")
        $(".map").toggleClass("--collapseLeft");
    });
    $(".results__collapseBtn").click(function () {
        $(".functionFilter").removeClass("--visible");
        $(".results").toggleClass("--collapse").removeAttr("style");
        $(".map").toggleClass("--collapseRight");
        $(".ActionBar").toggleClass("--collapseRight");
    });
    //Botones del panel//
    $('.toolBar__container__buttons__list__item__btn').click(function () {
        $(".toolBar__container__buttons__list__item").removeClass("--active");
        $(".toolBar__container__panel__functionBox").removeClass("--visible");
        $(".toolBar__container__buttons__list__item__btn").removeClass("--active");
        $("#map01").show();
        // $(".map__box06").removeClass("--active");
        $(this).addClass("--active");
        $(".toolBar").removeClass("--collapse");
        $(".MeasureTutorial").addClass("--invisible");

        if ($(this).hasClass("--active")) {
            $(".map").removeClass("--collapseLeft");
        }
        if ($(this).attr('id') == "PanelBtn__settings") {
            $(".toolBar__container__buttons__list__item").toggleClass("--active");
        }
        if ($(this).attr('id') == "PanelBtn__filter") {
            $(".functionFilter").addClass("--visible");
        }
        if ($(this).attr('id') == "PanelBtn__location") {
            $(".functionLocation").addClass("--visible");
        }
        if ($(this).attr('id') == "PanelBtn__time") {
            $(".functionTime").addClass("--visible");
        }
        if ($(this).attr('id') == "toolBar__btnLayers") {
            $(".functionSlides").addClass("--visible");
        }
        if ($(this).attr('id') == "toolBar__btnBaseMap") {
            $(".functionBaseMap").addClass("--visible");
        }
        if ($(this).attr('id') == "toolBar__btnMeasure") {
            $(".functionMeasure").addClass("--visible");
        }
        if ($(this).attr('id') == "toolBar__btnUpload") {
            $(".functionUpload").addClass("--visible");
        }
        if ($(this).attr('id') == "toolBar__btnAnalysis") {
            $(".functionAnalysis").addClass("--visible");
        }
        if ($(this).attr('id') == "toolBar__btn3D") {
            $(".function3D").addClass("--visible");
        }
        if ($(this).attr('id') == "toolBar__btnPalette") {
            $(".functionPalette").addClass("--visible");
        }
        if ($(this).attr('id') == "toolBar__btnFiltrar") {
            $(".functionFilter").addClass("--visible");
            $(".Geovisor__tableBox").removeClass("--visible");
        }
    });
}
function toolBar() {
    function init() {
        //Ocultar panel//
        $(".ActionBar__ToolBtn__btn").click(function () {
            $(this).toggleClass("--showTool");
            $(".ActionBar__list").toggleClass("--invisible");
        });
        if ($(window).width() < 769) {
            $(this).toggleClass("--showTool");
            $(".ActionBar__list").toggleClass("--invisible");
        }
    }
    return init();
}
function table() {
    function init() {
        //mostrar Tabla//
        $jq("#toolBar__btnTable").click(function () {
            $jq(".Geovisor__tableBox").toggleClass("--visible");
            $jq(".toolBar__btnTable").toggleClass("--active");
            $jq('html, body').animate({
                scrollTop: $jq(".Geovisor__tableBox").offset().top
            }, 1000);
        });
        $jq(".Geovisor__tableBox__top__close").click(function () {
            $jq(".Geovisor__tableBox").removeClass("--visible");
            $jq(".toolBar__btnTable").removeClass("--active");
            $jq('html, body').animate({
                scrollTop: $jq(".Header").offset().top
            }, 1000);
        });
    }
    return init();
}
function resultsScroll() {
    function init() {
        //scroll Mobile results//
        $jq("#toolBar__btnResults").click(function () {
            $jq(".toolBar").removeClass("--visible");
            $jq('html, body').animate({
                scrollTop: $jq(".results").offset().top
            }, 1000);
        });
    }
    return init();
}
function modal() {
    function init() {
        //Mostrar Modales//
        $jq("#PanelBtn__Share").click(function () {
            $jq(".ShareModal").toggleClass("--visible");
        });
        $("#PanelBtn__downloadMap").click(function () {
            $(".DownloadModal").toggleClass("--visible");
        });
        $jq("#PanelBtn__printModal").click(function () {
            $jq(".PrintModal").toggleClass("--visible");
        });
        $jq("#PanelBtn__help").click(function () {
            $jq(".HelpModal").toggleClass("--visible");
        });
        $("#PanelBtn__settings").click(function () {
            $(".functionFilter").removeClass("--visible");
            $(".toolBar").toggleClass("--settingsVisible");
        });
        $("#PanelBtn__location").click(function () {
            $(".toolBar").removeClass("--settingsVisible");
            $(".toolBar__container__panel__functionBox").removeClass("--visible");
            $(".functionLocation").toggleClass("--visible");
        })
        $("#PanelBtn__filter").click(function () {
            $(".toolBar").removeClass("--settingsVisible");
            $(".toolBar__container__panel__functionBox").removeClass("--visible");
            $(".functionFilter").toggleClass("--visible");
        })
        //Cerrar Modal//
        $jq(".Modal__Background__container__header__exit").click(function () {
            $jq(".Modal").removeClass("--visible");
        });
        $jq(".Modal__Background").click(function () {
            $jq(".Modal").removeClass("--visible");
        });
        //comaprtir tabs
        //about tabs
        $(".HelpModal__ListTabItem.--tab001").click(function () {
            $(".HelpModal__ListTabItem").removeClass("--active");
            $(this).addClass("--active");
            $(".HelpModal__ListTabContentItem").removeClass("--active");
            $(".HelpModal__ListTabContentItem.--content001").addClass("--active");
        });
        $(".HelpModal__ListTabItem.--tab002").click(function () {
            $(".HelpModal__ListTabItem").removeClass("--active");
            $(this).addClass("--active");
            $(".HelpModal__ListTabContentItem").removeClass("--active");
            $(".HelpModal__ListTabContentItem.--content002").addClass("--active");
        });
        $(".HelpModal__ListTabItem.--tab003").click(function () {
            $(".HelpModal__ListTabItem").removeClass("--active");
            $(this).addClass("--active");
            $(".HelpModal__ListTabContentItem").removeClass("--active");
            $(".HelpModal__ListTabContentItem.--content003").addClass("--active");
        });

    }
    return init();
}
function filterMenu() {
    $jq(".functionFilter__container__selectListbox__selectList__item").click(function () {
        $jq(".functionFilter__container__selectListbox__selectList__item").removeClass("--active");
        $jq(this).addClass('--active');
    });
}
function functionUploadButtons() {
    function init() {
        //cargar buttons
        $jq(".toolBar__container__panel__functionBox__uploadType__item#wms").click(function () {
            $jq(".toolBar__container__panel__functionBox__uploadType__item").removeClass("--active");
            $jq(this).addClass("--active");
            $jq(".toolBar__container__panel__functionBox__uploadType__type#--KML").removeClass("--visible");
            $jq(".toolBar__container__panel__functionBox__uploadType__type#--VMS").addClass("--visible");
        });
        $jq(".toolBar__container__panel__functionBox__uploadType__item#kml").click(function () {
            $jq(".toolBar__container__panel__functionBox__uploadType__item").removeClass("--active");
            $jq(this).addClass("--active");
            $jq(".toolBar__container__panel__functionBox__uploadType__type#--VMS").removeClass("--visible");
            $jq(".toolBar__container__panel__functionBox__uploadType__type#--KML").addClass("--visible");
        });
        $jq(".toolBar__container__panel__functionBox__uploadType__type__upload").click(function () {
            $jq(".toolBar__container__panel__functionBox__uploadType__type__seeLayer").first().addClass('--active');
        });
        $jq(".toolBar__container__panel__functionBox__uploadType__type__uploadbtn").click(function () {
            $jq(".toolBar__container__panel__functionBox__uploadType__type__seeLayer").last().addClass('--active');
        });
        //Botones del panel//
        $jq(".toolBar__container__panel__functionBox__uploadType__type__seeLayer").click(function () {
            $jq(".toolBar__container__panel__functionBox").removeClass("--visible");
            $jq(".functionSlides").addClass("--visible");
            $jq(".toolBar__container__buttons__list__item__btn").removeClass("--active");
            $jq(this).addClass("--active");
            $jq(".toolBar").removeClass("--collapse");
            if ($jq(this).hasClass("--active")) {
                $jq(".map").removeClass("--collapseLeft");
            }
        });
    }
    return init();
}
function accordion() {
    function init() {
        //Acordeones de la funcionalidad de filtros en el panel//
        for (var t = document.getElementsByClassName("functionFilter__accordion__btn"), n = 0; n < t.length; n++) {
            t[n].addEventListener("click", function () {
                this.classList.toggle("--active");
                var t = this.nextElementSibling;
                $jq(t).toggleClass("--open")
            });
        }
        for (var t = document.getElementsByClassName("functionFilter__accordion02__btn"), n = 0; n < t.length; n++) {
            t[n].addEventListener("click", function () {
                this.classList.toggle("--active");
                var t = this.nextElementSibling;
                $jq(t).toggleClass("--open")
            });
        }
    }
    return init();
}
function checkAction() {
    function init() {
        //Activar accion de check//
        $jq(".toolBar__container__panel__functionBox__checkList__item__container").click(function () {
            $jq(this).toggleClass("--active");
            var checkbox = $jq(this).children('input[type="checkbox"]');
            var slide = $jq(this).parent();
            checkbox.prop('checked', !checkbox.prop('checked'));
            slide.toggleClass('--visible');
        });
    }
    return init();
}
function radioAction() {
    function init() {
        //Activar accion de radio//
        $jq(".toolBar__container__panel__functionBox__radioList__item").click(function () {
            $jq('.toolBar__container__panel__functionBox__radioList__item').removeClass("--active");
            $jq(this).toggleClass("--active");
            var radio = $jq(this).children('input[type="radio"]');
            radio.prop('checked', !radio.prop('checked'));
        });
    }
    return init();
}
function measureFilter() {
    $jq("#Measure__button__Distance").click(function () {
        $jq('.toolBar__container__panel__functionBox__step__btnList__item__button').removeClass("--active");
        $jq('.toolBar__container__panel__functionBox__step__btnList__item').removeClass("--visible");
        $jq(this).addClass("--active");
        $jq('#measure__step02').addClass("--active");
        $jq('#Measure__item__button__line').addClass("--visible");
        //tutorial
        $jq('.MeasureTutorial').removeClass("step01", "step03").addClass("step02");
        $jq('.MeasureTutorial__list__item').removeClass("--visible");
        $jq('.MeasureTutorial__list__item.step02').addClass("--visible");
    });
    $jq("#Measure__button__area").click(function () {
        $jq('.toolBar__container__panel__functionBox__step__btnList__item__button').removeClass("--active");
        $jq('.toolBar__container__panel__functionBox__step__btnList__item').removeClass("--visible");
        $jq(this).addClass("--active");
        $jq('#measure__step02').addClass("--active");
        $jq('#Measure__item__button__square').addClass("--visible");
        $jq('#Measure__item__button__polygon').addClass("--visible");
        $jq('#Measure__item__button__circle').addClass("--visible");
        //tutorial
        $jq('.MeasureTutorial').removeClass("step01", "step03").addClass("step02");
        $jq('.MeasureTutorial__list__item').removeClass("--visible");
        $jq('.MeasureTutorial__list__item.step02').addClass("--visible");
    });
    $jq("#Measure__button__draw").click(function () {
        $jq('.toolBar__container__panel__functionBox__step__btnList__item__button').removeClass("--active");
        $jq('.toolBar__container__panel__functionBox__step__btnList__item').removeClass("--visible");
        $jq(this).addClass("--active");
        $jq('#measure__step02').addClass("--active");
        $jq('#Measure__item__button__line').addClass("--visible");
        $jq('#Measure__item__button__square').addClass("--visible");
        $jq('#Measure__item__button__polygon').addClass("--visible");
        $jq('#Measure__item__button__circle').addClass("--visible");
        //tutorial
        $jq('.MeasureTutorial').removeClass("step01", "step03").addClass("step02");
        $jq('.MeasureTutorial__list__item').removeClass("--visible");
        $jq('.MeasureTutorial__list__item.step02').addClass("--visible");
        $jq('#measure__step03').removeClass("--active");
    });
    $jq("#Measure__item__button__line").click(function () {
        $jq('.toolBar__container__panel__functionBox__step__btnList__item').removeClass("--active");
        $jq('#measure__step03').addClass("--active");
        $jq(this).addClass("--active");
        if ($jq("#Measure__button__draw").hasClass("--active")) {
            $jq(".toolBar__container__panel__functionBox__step__title").hide();
            $jq(".toolBar__container__panel__functionBox__text").hide();
            $jq(".toolBar__container__panel__functionBox__textMeasureValue").hide();
        }
        else {
            $jq(".toolBar__container__panel__functionBox__step__title").show();
            $jq(".toolBar__container__panel__functionBox__text").show();
            $jq(".toolBar__container__panel__functionBox__textMeasureValue").show();
        }
        //tutorial
        $jq('.MeasureTutorial').removeClass("step01", "step02").addClass("step03");
        $jq('.MeasureTutorial__list__item').removeClass("--visible");
        $jq('.MeasureTutorial__list__item.step03').addClass("--visible");
    });
    $jq("#Measure__item__button__square").click(function () {
        $jq('.toolBar__container__panel__functionBox__step__btnList__item').removeClass("--active");
        $jq(this).addClass("--active");
        $jq('#measure__step03').addClass("--active");
        if ($jq("#Measure__button__draw").hasClass("--active")) {
            $jq(".toolBar__container__panel__functionBox__step__title").hide();
            $jq(".toolBar__container__panel__functionBox__text").hide();
            $jq(".toolBar__container__panel__functionBox__textMeasureValue").hide();
        }
        else {
            $jq(".toolBar__container__panel__functionBox__step__title").show();
            $jq(".toolBar__container__panel__functionBox__text").show();
            $jq(".toolBar__container__panel__functionBox__textMeasureValue").show();
        }
        //tutorial
        $jq('.MeasureTutorial').removeClass("step01", "step02").addClass("step03");
        $jq('.MeasureTutorial__list__item').removeClass("--visible");
        $jq('.MeasureTutorial__list__item.step03').addClass("--visible");
    });
    $jq("#Measure__item__button__polygon").click(function () {
        $jq('.toolBar__container__panel__functionBox__step__btnList__item').removeClass("--active");
        $jq(this).addClass("--active");
        $jq('#measure__step03').addClass("--active");
        if ($jq("#Measure__button__draw").hasClass("--active")) {
            $jq(".toolBar__container__panel__functionBox__step__title").hide();
            $jq(".toolBar__container__panel__functionBox__text").hide();
            $jq(".toolBar__container__panel__functionBox__textMeasureValue").hide();
        }
        else {
            $jq(".toolBar__container__panel__functionBox__step__title").show();
            $jq(".toolBar__container__panel__functionBox__text").show();
            $jq(".toolBar__container__panel__functionBox__textMeasureValue").show();
        }
        //tutorial
        $jq('.MeasureTutorial').removeClass("step01", "step02").addClass("step03");
        $jq('.MeasureTutorial__list__item').removeClass("--visible");
        $jq('.MeasureTutorial__list__item.step03').addClass("--visible");
    });
    $jq("#Measure__item__button__circle").click(function () {
        $jq('.toolBar__container__panel__functionBox__step__btnList__item').removeClass("--active");
        $jq(this).addClass("--active");
        $jq('#measure__step03').addClass("--active");
        if ($jq("#Measure__button__draw").hasClass("--active")) {
            $jq(".toolBar__container__panel__functionBox__step__title").hide();
            $jq(".toolBar__container__panel__functionBox__text").hide();
            $jq(".toolBar__container__panel__functionBox__textMeasureValue").hide();
        }
        else {
            $jq(".toolBar__container__panel__functionBox__step__title").show();
            $jq(".toolBar__container__panel__functionBox__text").show();
            $jq(".toolBar__container__panel__functionBox__textMeasureValue").show();
        }
        //tutorial
        $jq('.MeasureTutorial').removeClass("step01", "step02").addClass("step03");
        $jq('.MeasureTutorial__list__item').removeClass("--visible");
        $jq('.MeasureTutorial__list__item.step03').addClass("--visible");
    });
}
function selectGraph() {
    function init() {
        //Activar accion menu de graficas//
        $(".results__panel__selectGraph").click(function () {
            $(this).toggleClass("--active");
        });
        //Activar accion menu de graficas//
        $(".results__panel__selectGraph__principalList__item").click(function () {
            $('.results__panel__selectGraph__principalList__item').removeClass("--active");
            $(this).toggleClass("--active");
        });
    }
    return init();
}
function responsive() {
    if ($jq(window).width() < 1030) {
        $jq('.results').addClass('--collapseRight');
        $jq('.map').addClass('--collapseRight');
    }
    else {
        $jq('.results').removeClass('--collapseRight');
        $jq('.map').removeClass('--collapseRight');
    }
    if ($jq(window).width() < 769) {
        $jq('.toolBar').addClass('--collapse');
        $jq('.ActionBar').addClass('--collapseRight');
        $jq('.results').addClass('--collapseRight');
        $jq('.map').addClass('--collapseLeft');
        $jq('.map').addClass('--collapseRight');
        $jq('.Btn__Results').removeClass('--invisible');
    }
    else {
        $jq('.toolBar').removeClass('--collapse');
        $jq('.ActionBar').removeClass('--collapseRight');
        $jq('.results').removeClass('--collapseRight');
        $jq('.map').removeClass('--collapseLeft');
        $jq('.map').removeClass('--collapseRight');
        $jq('.Btn__Results').addClass('--invisible');
    }
}
function tutorial() {
    //close tutorial
    $jq(".Tutorial__close").click(function () {
        $jq('.Tutorial').addClass("--invisible");
    });
    //cookie
    if (cookie('noShowWelcome')) $jq('.Tutorial').addClass("--invisible");
    else {
        $jq(".Tutorial__close").click(function () {
            $jq(".Tutorial").addClass("--invisible");
            cookie('noShowWelcome', true);
        });
    }
    //skip tutorial
    $jq(".Tutorial__control__skipTutorial").click(function () {
        $jq('.Tutorial').addClass("--invisible");
    });
    //next step
    $jq(".step01.Tutorial__control__after").click(function () {
        $jq('.Tutorial__step01').removeClass("--visible");
        $jq('.Tutorial__step02').addClass("--visible");
    });
    $jq(".step02.Tutorial__control__after").click(function () {
        $jq('.Tutorial__step02').removeClass("--visible");
        $jq('.Tutorial__step03').addClass("--visible");
    });
    $jq(".step03.Tutorial__control__after").click(function () {
        $jq('.Tutorial__step03').removeClass("--visible");
        $jq('.Tutorial__step04').addClass("--visible");
    });
    $jq(".step04.Tutorial__control__after").click(function () {
        $jq('.Tutorial__step04').removeClass("--visible");
        $jq('.Tutorial__step05').addClass("--visible");
    });
    //previous step
    $jq(".step02.Tutorial__control__before").click(function () {
        $jq('.Tutorial__step02').removeClass("--visible");
        $jq('.Tutorial__step01').addClass("--visible");
    });
    $jq(".step03.Tutorial__control__before").click(function () {
        $jq('.Tutorial__step03').removeClass("--visible");
        $jq('.Tutorial__step02').addClass("--visible");
    });
    $jq(".step04.Tutorial__control__before").click(function () {
        $jq('.Tutorial__step04').removeClass("--visible");
        $jq('.Tutorial__step03').addClass("--visible");
    });
    $jq(".step05.Tutorial__control__before").click(function () {
        $jq('.Tutorial__step05').removeClass("--visible");
        $jq('.Tutorial__step04').addClass("--visible");
    });
}
function tutorialMeasure() {
    //close tutorial
    $jq(".MeasureTutorial__close").click(function () {
        $jq('.MeasureTutorial').addClass("--invisible").removeClass("step02").removeClass("step03").addClass("step01");
        $jq('.MeasureTutorial__list__item.step03').removeClass("--visible");
        $jq('.MeasureTutorial__list__item.step02').removeClass("--visible");
        $jq('.MeasureTutorial__list__item.step01').addClass("--visible");
    });
    //cookie
    if (cookie('noShowWelcome')) $jq('.MeasureTutorial').addClass("--invisible");
    else {
        $jq(".MeasureTutorial__close").click(function () {
            $jq('.MeasureTutorial').addClass("--invisible").removeClass("step02").removeClass("step03").addClass("step01");
            $jq('.MeasureTutorial__list__item.step03').removeClass("--visible");
            $jq('.MeasureTutorial__list__item.step02').removeClass("--visible");
            $jq('.MeasureTutorial__list__item.step01').addClass("--visible");
            cookie('noShowWelcome', true);
        });
    }
}
function analysis() {
    //paso 01
    $jq(".functionAnalysis__StepContainer__btn").click(function () {
        $jq('.functionAnalysis__step02').removeClass("--invisible");
        $jq('.functionAnalysis__step03').removeClass("--invisible");
        $jq('.functionAnalysis__StepContainer__btn').removeClass("--active");
        $jq(this).addClass('--active');
        if ($jq('.functionAnalysis__location').hasClass('--active')) {

            $jq('.functionAnalysis__step03 .toolBar__container__panel__functionBox__step__text').removeClass('--invisible');
            $jq('.functionAnalysis__step03 .functionAnalysis__boxDescription').removeClass('--invisible');

            $jq('.toolBar__container__panel__functionBox__radioList__item').removeClass('--invisible');
            $jq('.--AnalysisHouseConcentration').addClass('--invisible');

            $jq('.toolBar__container__panel__functionBox__radioList__item').removeClass('--active');
            $jq('.functionAnalysis__list__option.--option01').addClass("--invisible");
            $jq('.functionAnalysis__list__option.--option02').addClass("--invisible");
            $jq('.functionAnalysis__list__option.--option03').addClass("--invisible");

            $jq(".results").removeClass("--collapse");
            $jq(".map__legend svg").remove();
            $jq(".map__legend img").remove();
            $jq(".map__legend_2 svg").remove();
            $jq(".map").removeClass("--collapseRight");
            $jq(".ActionBar").removeClass("--collapseRight");
        }
        if ($jq('.functionAnalysis__heatmap').hasClass('--active')) { //functionAnalysis__boxDescription__text
            $jq('.functionAnalysis__step03 .toolBar__container__panel__functionBox__step__text').addClass('--invisible');
            $jq('.functionAnalysis__step03 .functionAnalysis__boxDescription').addClass('--invisible');
            $jq('.--option03 .functionAnalysis__boxDescription').removeClass('--invisible');

            $jq('.--AnalysisArea').addClass('--invisible');
            $jq('.--AnalysisDrawArea').addClass('--invisible');
            $jq('.--AnalysisHouseConcentration').removeClass('--invisible');

            $jq('.toolBar__container__panel__functionBox__radioList__item').removeClass('--active');
            $jq('.functionAnalysis__list__option.--option01').addClass("--invisible");
            $jq('.functionAnalysis__list__option.--option02').addClass("--invisible");
            $jq('.functionAnalysis__list__option.--option03').addClass("--invisible");


            $jq('.--AnalysisHouseConcentration').addClass("--active");
            $jq('.functionAnalysis__list__option').addClass("--invisible");
            $jq('.functionAnalysis__list__option.--option03').removeClass("--invisible");

            $jq(".results").addClass("--collapse");
            $jq(".map__legend svg").remove();
            $jq(".map__legend_2 svg").remove();
            $jq(".map").addClass("--collapseRight");
            $jq(".ActionBar").addClass("--collapseRight");
        }
    });
    //seleccionar opciones
    $jq(".toolBar__container__panel__functionBox__radioList__item.--AnalysisArea").click(function () {
        $jq('.functionAnalysis__list__option').addClass("--invisible");
        $jq('.functionAnalysis__list__option.--option01').removeClass("--invisible");
    });
    $jq(".toolBar__container__panel__functionBox__radioList__item.--AnalysisDrawArea").click(function () {
        $jq('.functionAnalysis__list__option').addClass("--invisible");
        $jq('.functionAnalysis__list__option.--option02').removeClass("--invisible");
    });
    $jq(".toolBar__container__panel__functionBox__radioList__item.--AnalysisHouseConcentration").click(function () {
        $jq('.functionAnalysis__list__option').addClass("--invisible");
        $jq('.functionAnalysis__list__option.--option03').removeClass("--invisible");
    });
}
function palette() {
    $jq(".functionPalette__container__selectListbox__selectList__item").click(function () {
        $jq(".functionPalette__container__selectListbox__selectList__item").removeClass("--active");
        $jq(this).addClass('--active');
    });
}
function resizeLeft() {
    //ajuste toolbar - panel izquierdo
    // Eventos - Detecta los cambios sobre el div de borde y llama la función resize()  
    var resize_el = document.getElementById('toolBar__resize');
    resize_el.addEventListener('mousedown', function (e) {
        w_leftbar = e.x;
        document.addEventListener('mousemove', resize, false);
    }, false);
    document.addEventListener('mouseup', function () {
        document.removeEventListener('mousemove', resize, false);
    }, false);

    // Función - Recibe la posición del ancho del borde del mapa y redimensiona la misma.
    function resize(e) {
        var windowWidth = $(document).width();
        w_leftbar = (100 * (e.x)) / windowWidth;
        // Limita el desplazamiento del borde de la función deslizar derecha/izquierda
        if (w_leftbar > windowWidth) {
            w_leftbar = windowWidth;
        }
        if (w_leftbar < 21) {
            w_leftbar = 21;
        }
        document.getElementById("toolBar").style.width = w_leftbar + "%";
        if (w_leftbar > windowWidth) {
            document.getElementById("toolBar").style.width = windowWidth - 20;
        }
        if (w_leftbar < 21) {
            document.getElementById("toolBar").style.width = 30;
        }
    }
}
function resizeRight() {
    //ajuste  results - panel derecho
    // Eventos - Detecta los cambios sobre el div de borde y llama la función resize()  
    var resize_el = document.getElementById('results__resize');
    resize_el.addEventListener('mousedown', function (e) {
        w_rightbar = e.x;
        document.addEventListener('mousemove', resize, false);
    }, false);
    document.addEventListener('mouseup', function () {
        document.removeEventListener('mousemove', resize, false);
    }, false);

    // Función - Recibe la posición del ancho del borde del mapa y redimensiona la misma.
    function resize(e) {
        var windowWidth = $(document).width();
        w_rightbar = (100 * (e.x)) / windowWidth;
        // Limita el desplazamiento del borde de la función deslizar derecha/izquierda
        if (w_rightbar > windowWidth) {
            w_rightbar = windowWidth;
        }
        if (w_rightbar < 21) {
            w_rightbar = 21;
        }
        document.getElementById("results").style.width = w_rightbar + "%";
    }
}
$jq(document).ready(initBasicActions);

