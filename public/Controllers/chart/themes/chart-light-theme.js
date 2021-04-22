(function (Highcharts) {

    /**
     * Light Black theme for Highcharts JS
     * @author AkramKamal
     */


    var highstockLightTheme = {
        chart: {
            backgroundColor: '#fff'
        }
    };
    Highcharts.theme = Highcharts.merge(Highcharts.theme, highstockLightTheme);
    Highcharts.setOptions(Highcharts.theme);


})(Highcharts)
