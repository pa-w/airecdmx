$(document).ready(function () {
	var conf = {
		data: {
			contaminantes: { 
				type: d3.csv,
				url: 'data/contaminantes.csv',
				id: "contaminantes",
				processor: function (rows) { 
					var nest = new Nestify (rows, ["contaminante", "anio", "semana"], ["avg", "stddev", "anio", "semana"]).data;
					return {data: nest};
				}
			}
		},
		prequantifiers: {
			contaminantes: function (args) { 
				var contData = this.data.contaminantes.data [args.contaminante];
				var lines = [], maxs = [], mins = [];
				for (var y in contData) {
					if (parseInt (y) === Number (y)) {
						var yearData = contData [y];
						var extent = yearData.extent (function (a) { var a = Math.round (parseFloat (a.values.avg.value), 2); if (a != NaN) { return a; }});
						maxs.push (extent [1]);
						mins.push (extent [0]);
						lines.push ({key: args.contaminante, values: yearData.values (), attrs: {"class": "line anio_" + y} });
					}
				}
				var scale = d3.scale.linear ().domain ([Math.max.apply (Math, maxs), Math.min.apply  (Math, mins)]);
				return {data: lines.reverse (), scale: scale}
			}
		},
		quantifiers: {
			maps: {},
			bars: {},
			lines: {
				contaminantes: function (x, d, a) { 
					var parse = [
						{"control_element": ".semana", "element_remove_class": "highlight"},
						{"control_element": ".semana_" + x.semana.value, "element_add_class": "highlight"},
					];
					var data = {
						parse: parse
					};
					var periodo = "referencia";
					var semana = parseInt (x.semana.value), anio = parseInt (x.anio.value);

					if (semana > 29) {
						periodo = "amparo"
					} 
					if ((semana > 49 && anio >= 2015) || anio == 2016) { 
						periodo = "reglamento"
					}
					return {"class": "anio_" + anio + " line semana " + periodo + " semana_" + semana, "y": a.scale (x.avg.value), "r": 2, "data": data};
				}
			}
		}, callbacks: {
			init: function () { 
				var data = this.data.contaminantes.data;
				var conts = data.items ();
				for (var x in conts) { 
					var scene = $("<div>");
					scene.append ($("<h1>").text (conts [x].key));
					var div = $("<div id='" + conts [x].key + "' class='chart'>");
					scene.append (div);
					div.data ({"chart": "lines", "quantify": "contaminantes", "quantifier": "contaminantes", "quantifier_args": {"contaminante": conts [x].key}}); 
					$("#movie").append (scene);
					this.initChart (div);
				}
				this.initScroll ();
			}
		}

	};
	var d = new Ant (conf);
});
