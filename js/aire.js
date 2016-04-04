$(document).ready(function () {
	var imeca = function (contaminante, concentracion) { 
		switch (contaminante) { 
			case 'ozono': 
		}
	}
	var conf = {
		data: {
			contaminantes: { 
				type: d3.csv,
				url: 'data/contaminantes.csv',
				id: "contaminantes",
				processor: function (rows) { 
					var nest = new Nestify (rows, ["contaminante", "anio", "semana", "dia"], ["dia", "avg", "stddev", "anio", "semana"]).data;
					return {data: nest};
				}
			}
		},
		prequantifiers: {
			linear: function (args) { 
				var contData = this.data.contaminantes.data [args.contaminante], values = [];
				for (var y in contData) { 
					if (parseInt (y) === Number (y)) { 
						for (var s in contData [y]) {
							if (parseInt (s) === Number (s)) {
								for (var d in contData [y] [s]) {
									if (parseInt (d) === Number (d)) {
										values.push ({anio: y, semana: s, dia: d, avg: contData [y] [s] [d].avg.value});
									}
								}
							}
						}
					}
				}
				var ext = d3.extent (values, function (a) { return parseFloat (a.avg); });
				var line = {values: values, attrs: {"class": "line"}};
				return {data: [line], scale: d3.scale.linear ().domain (ext)}
			},
			semana: function (args) { 
				var contData = this.data.contaminantes.data [args.contaminante];
				var lines = [], maxs = [], mins = [];
				for (var y in contData) {
					if (parseInt (y) === Number (y)) {
						var values = [];
						if (contData [y] [args.semana]) {
							for (var d in contData [y] [args.semana]) { 
								if (parseInt (d) === Number (d) && contData [y] [args.semana] [d].avg.value) {
									values.push ({dia: d, anio: y, avg: contData [y] [args.semana] [d].avg.value});
								}
							}
						}
						var ext = d3.extent (values, function (a)  { return parseFloat (a.avg); });
						if (ext [0] !== undefined && ext [1] !== undefined) {
							maxs.push (ext [1]);
							mins.push (ext [0]);
						}
						lines.push ({values: values, attrs: {"class": "line anio_" + y, "stepped": true}});
					}
				}
				var scale = d3.scale.linear ().domain ([Math.min.apply (Math, mins), Math.max.apply (Math, maxs)]);
				return {data: lines.reverse (), scale: scale};
			},
			contaminantes: function (args) { 
				var contData = this.data.contaminantes.data [args.contaminante];
				var lines = [], maxs = [], mins = [];
				for (var y in contData) {
					if (parseInt (y) === Number (y)) {
						var yearData = contData [y];
						var values = []
						for (var s in yearData) {
							if (parseInt (s) === Number (s)) {
								var semanaData = yearData [s];
								var extent = semanaData.extent (function (a) { var a = Math.round (parseFloat (a.values.avg.value), 2); if (a != NaN) { return a; }});
								var vals = semanaData.values ();
								values.push ({semana: s, anio: y, avg: d3.mean (vals, function (a) {  return a.avg.value; }), max: d3.max (vals, function (a) { return a.avg.value; })});
							}
						}
						var ext = d3.extent (values, function (a) { return a.avg; })
						maxs.push (ext [1]);
						mins.push (ext [0]);
						lines.push ({key: args.contaminante, values: values, attrs: {"class": "line anio_" + y, "stepped": true} });
					}
				}
				var scale = d3.scale.linear ().domain ([Math.min.apply (Math, mins), Math.max.apply  (Math, maxs)]);
				return {data: lines.reverse (), scale: scale}
			}
		},
		quantifiers: {
			maps: {},
			bars: {},
			lines: {
				linear: function (x, d, a) { 
					var parse = [
						{"control_element": ".semana", "element_remove_class": "highlight"},
						{"control_element": ".semana_" + x.semana, "element_add_class": "highlight"},
						{"control_chart": "semana", "quantify": "contaminantes", "quantifier": "semana", "quantifier_args": {"semana": x.semana, "contaminante": d.contaminante } }
					], note, periodo = "referencia";
					if (x.semana == 1 && x.dia == 6) { 
						note = x.anio;	
					}
					if ((x.semana > 29 && x.anio == 2015) || x.anio == 2016) {
						periodo = "amparo"
					} 
					if ((x.semana > 49 && x.anio == 2015) || x.anio == 2016) { 
						periodo = "reglamento"
					}
					return {"note": note, "r": 2, "value": Math.round(x.avg), "y": a.scale (x.avg), "class": periodo + " line semana anio dia semana_" + x.semana + " anio_" + x.anio + " dia_" + x.dia, "data": {parse: parse}};
				},
				semana: function (x, d, a) { 
					var days = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
					
					return {"label": days [x.dia], "value": x.anio + ": " + Math.round (x.avg), "y": a.scale (x.avg), "class": "line", "data": {}};
				},
				contaminantes: function (x, d, a) { 
					var parse = [
						{"control_element": ".semana", "element_remove_class": "highlight"},
						{"control_element": ".semana_" + x.semana, "element_add_class": "highlight"},
						{"control_chart": "semana", "quantify": "contaminantes", "quantifier": "semana", "quantifier_args": {"semana": x.semana, "contaminante": d.contaminante } }
					];
					var data = {
						parse: parse
					}, 
						note, label,
						periodo = "referencia", 
						semana = parseInt (x.semana), 
						anio = parseInt (x.anio);

					if ((semana > 29 && anio == 2015) || anio == 2016) {
						periodo = "amparo"
					} 
					if ((semana > 49 && anio == 2015) || anio == 2016) { 
						periodo = "reglamento"
					}
					if (anio == 2013) {
						label = "semana " + semana;	
					}
					return {"value": anio + ": " + Math.round (x.avg), "label": label, "class": "anio_" + anio + " line semana " + periodo + " semana_" + semana, "y": a.scale (x.avg), "r": 1, "data": data};
				}
			}
		}, callbacks: {
		}

	};
	var d = new Ant (conf);
});
