(function (Highcharts) {

    /**
 * Grid-light theme for Highcharts JS
 * @author Torstein Honsi
 */

    Highcharts.theme = {
        colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
            "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        chart: {
            backgroundColor: null,
            style: {
                fontFamily: "Open Sans"
            }
        },
        title: {
            style: {
                fontSize: '14px',
                fontWeight: 'normal',
                textTransform: 'uppercase'
            }
        },
        tooltip: {
            borderWidth: 0,
            backgroundColor: 'rgba(255,255,255,0.8)',
            shadow: true
        },
        legend: {
            itemStyle: {
                fontWeight: 'bold',
                fontSize: '13px'
            }
        },
        xAxis: {
            gridLineWidth: 1,
            tickInterval: 2,
            labels: {
                style: {
                    fontSize: '13px'
                }
            }
        },
        yAxis: {
            minorTickInterval: 'auto',
            title: {
                style: {
                    textTransform: 'uppercase'
                }
            },
            labels: {
                style: {
                    fontSize: '13px'
                }
            }
        },
        plotOptions: {
            candlestick: {
                lineColor: '#404048'
            }
        },


        // General
        background2: '#F0F0EA'

    };

    // Apply the theme
    Highcharts.setOptions(Highcharts.theme);


})(Highcharts)