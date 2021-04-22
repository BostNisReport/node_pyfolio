(function (Highcharts) {

    /**
     * Dark Black theme for Highcharts JS
     * @author AkramKamal
     */


    //shared varialbles:
    var buttonsStyle = {
        'font-size': '14px'
    };


    var highstockDefaultTheme = {
        chart: {
            borderWidth: 0,
            alignTicks: true,
            animation: true,
            borderRadius: 0,
            plotBorderWidth: 0,
            pinchType: 'y',
            marginBottom: 30
        },
        title: {
            style: {
                font: 'bold 16px "Open Sans", sans-serif'
            }
        },
        subtitle: {
            style: {
                font: 'bold 12px "Open Sans", sans-serif'
            }
        },
        plotLine: {
            color: 'gray',
            width: 1,
            zIndex: 100,
        },
        plotBand: {
            color: 'rgba(200, 200, 200, 0.5)',
            borderColor: 'transparent',
            borderWidth: 0,
            label: {
                align: 'center',
                verticalAlign: 'top',
                y: 25,
                style: {}
            }
        },
        annotation: {
            fill: '#f8f8f8',
            stroke: 'gray',
            'stroke-width': 1,
            label: {
                style: {}
            },
            style: {
                cursor: 'pointer'
            }
        },
        lineAnnotation: {
            'stroke-width': 2
        },
        xAxis: {
            gridLineWidth: 0,
            labels: {
                style: {}
            },
            lineWidth: 0,
            tickWidth: 0,
            title: {
                style: {
                    fontWeight: 'normal',
                    fontSize: '13px',
                    fontFamily: "'Open Sans', sans-serif"

                }
            },
            dateTimeLabelFormats: {
                day: '%m/%d/%y',
                hour: '%H:%M'
            }
        },
        yAxis: {
            opposite: false,
            labels: {
                style: {},
                enabled: true,
                align: 'left',
                x: 7,
                y: -2
            },
            lineColor: '#C0C0C0',
            minorTickInterval: null,
            tickWidth: 0,
            lineWidth: 0.8,
            gridLineWidth: 0.8,
            title: {
                style: {
                    fontWeight: 'normal',
                    fontSize: '13px',
                    fontFamily: "'Open Sans', sans-serif"
                },
                align: 'high'
            },
            endOnTick: true,
            startOnTick: true
        },
        tooltip: {
            borderWidth: 1,
            borderRadius: 10,
            hideDelay: 250,
            shared: false,
            valueDecimals: 2,
            //headerFormat: '<span style="font-size: 10px">(To delete press "Ctrl" and click)<br/>{point.key}</span><br/>',
            crosshairs: [{
                width: 1,
                // color: 'lime',
                zIndex: 22
            }
                /*, {
                    width: 1,
                    color: 'lime',
                    zIndex: 22
                }*/
            ]
        },
        plotOptions: {
            series: {
                //compare: 'percent'
                turboThreshold: null
            }
        },
        legend: {
            itemStyle: {
                font: '9pt "Open Sans", sans-serif',
            },
            itemHoverStyle: {},
            itemHiddenStyle: {},
            align: 'center',
            verticalAlign: 'top',
            y: 30,
            floating: true,
            shadow: true
        },
        credits: false,
        labels: {
            style: {}
        },

        navigation: {
            menuStyle: {
                border: '1px solid #A0A0A0',
                padding: '5px 0'
            },
            menuItemStyle: {
                padding: '1px 10px',
            },
            menuItemHoverStyle: {},
            buttonOptions: {
                symbolSize: 14,
                symbolStrokeWidth: 3,
                symbolX: 12.5,
                symbolY: 10.5,
                align: 'right',
                buttonSpacing: 3,
                height: 22,
                theme: {},
                verticalAlign: 'top',
                width: 24
            }
        },

        // scroll charts
        rangeSelector: {
            selected: 1,
            buttons: [{
                type: 'day',
                count: 1,
                text: '1d'
            }, {
                    type: 'week',
                    count: 1,
                    text: '1w'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1y'
                }, {
                    type: 'all',
                    text: 'All'
                }],
            inputEnabled: false,
            buttonTheme: {
                'stroke-width': 0,
                r: 8,
                style: {
                    color: '#999',
                    fontWeight: 'normal'
                },
                states: {
                    hover: {
                    },
                    select: {
                        fill: '#ddd',
                        style: {
                            color: '#777'
                        }
                    }
                    // disabled: { ... }
                }
            },
            inputStyle: {
                textAlign: 'left'
            },
            labelStyle: {

            },
            inputDateFormat: '%Y-%m-%d',
            inputBoxWidth: 65
        },

        navigator: {
            handles: {},
            series: {}
        },

        scrollbar: {
            liveRedraw: false,
            minWidth: 20,
            barBackgroundColor: '#e5e5e5',
            barBorderWidth: 1,
            barBorderColor: '#ccc',
            buttonBackgroundColor: '#f9f9f9',
            buttonBorderWidth: 1,
            buttonBorderColor: '#ddd',
            trackBackgroundColor: '#f9f9f9',
            trackBorderWidth: 1,
            trackBorderColor: '#ddd',
        }
    };
    Highcharts.theme = Highcharts.merge(Highcharts.theme, highstockDefaultTheme);
    Highcharts.setOptions(Highcharts.theme);



})(Highcharts)
