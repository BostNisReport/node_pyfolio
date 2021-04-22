(function (root) {

    "use strict";


    /******************************************************************************\
    Directive:
        sabSlickSlider <sab-slick-slider>
    
    Dependencies:
        None
    
    Inputs:
        =value   - value to bind this slider to
        @min     - min value
        @max     - max value
        @default - default, if source is undefined
    
    Description:
        Slider directive
    \******************************************************************************/
    angular.module("sabhiram.slick-slider", [])
    .directive("sabSlickSlider", function () {
        return {
            restrict: "E",
            scope: {
                val: "=value",
                min: "@",
                max: "@",
                step: "@",
                default: "@"
            },
            replace: true,
            transclude: true,
            template: [
                "<div  onclick='arguments[0].stopPropagation()'>",
                "    <div class='col-xs-4 ' >",
                "        <div  ng-transclude style='margin-top:5px'>",
                "        </div>",
                "    </div>",
                "    <div class='col-xs-8 ' >",
                "        <div class='jqx-slider-input'  ></div>",
                "    </div>",
                "</div>",
            ].join("\n"),
            link: function (scope, element, attributes) {
                scope.min = parseInt(scope.min, 10) || 0;
                scope.max = parseInt(scope.max, 10) || 100;
                scope.step = parseInt(scope.min, 10) || 1;
                scope.default = parseInt(scope.default, 10) || 50;
                scope.val = parseInt(scope.val, 10) || scope.default;

                var sliderDiv = $(element).find('.jqx-slider-input');
                $(sliderDiv).jqxSlider({ showButtons: false, showTicks: false, min: scope.min, max: scope.max, ticksFrequency: 10, value: scope.val, step: 10, width: '100%', theme: window.jqxTheme });
                scope.$watch('val', function () {
                    $(sliderDiv).jqxSlider('setValue', scope.val);
                })

                //invoke the apply function after 300 milliseconds, so the UI keep stable
                var apply = utilities.timeout(function () {
                    scope.$applyAsync();
                }, 300);


                $(sliderDiv).on('change', function (event) {
                    scope.val = $(sliderDiv).jqxSlider('getValue');
                    apply.touch();
                });
            }
        };
    });


})(this)