var knownLanguages = ["cz","de","en","it","jp","pt_br","ru","sk"];

async function coinmap() {
	var tileOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		maxZoom: 18
	});

    var tileOSMBlackAndWhite = L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var tileOpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var tileOpenMapSurferRoads = L.tileLayer('https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png', {
        attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    });

    var tileCartoLight = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.',
        maxZoom: 18
    });

    var tileCartoDark = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.',
        maxZoom: 18
    });

    var tileHyddaFull = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
        attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    });

    var tileStamenToner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png'
    });

	var tileStamenWatercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		subdomains: 'abcd',
		minZoom: 1,
		maxZoom: 18,
		ext: 'jpg'
	});
    // More tiles here: http://leaflet-extras.github.io/leaflet-providers/preview/index.html

	var clusters = {};
	var cluster_types = ["All", "Venues", "ATMs"];
	for (var i = 0; i < cluster_types.length; i++) {
		clusters[cluster_types[i]] = new L.MarkerClusterGroup({showCoverageOnHover: false, maxClusterRadius: 64});
	}

	window.total_count = 0;

	await coinmap_populate_overpass(clusters);

	$('#loading').hide();
	$('#container').show();

	var map_layers = [tileOSM];
	map_layers.push(clusters[cluster_types[0]]); // enable just first coin

	var map = L.map('map', {
		center: [0, 0],
		zoom: 3,
		layers: map_layers,
		worldCopyJump: true
	});

	// var layers = L.control.layers({
	// 	"OpenStreetMap": tileOSM,
    //     "OSM Black & White": tileOSMBlackAndWhite,
    //     "OpenTopoMap": tileOpenTopoMap,
    //     "OpenMapSurfer Roads": tileOpenMapSurferRoads,
    //     "Carto Light": tileCartoLight,
    //     "Carto Dark": tileCartoDark,
    //     "Hydda Full": tileHyddaFull,
    //     "Stamen Toner": tileStamenToner,
    //     "Stamen Water Color": tileStamenWatercolor
	// }, null, {
	// 	collapsed: false
	// }).addTo(map);

	L.control.groupedLayers({
			"OpenStreetMap": tileOSM,
		    "OSM Black & White": tileOSMBlackAndWhite,
		    "OpenTopoMap": tileOpenTopoMap,
		    "OpenMapSurfer Roads": tileOpenMapSurferRoads,
		    "Carto Light": tileCartoLight,
		    "Carto Dark": tileCartoDark,
		    "Hydda Full": tileHyddaFull,
		    "Stamen Toner": tileStamenToner,
		    "Stamen Water Color": tileStamenWatercolor
		}, { "Show:": clusters }, { collapsed: true, exclusiveGroups: ["Show:"] }).addTo(map)

	map.on('moveend', function(e){
		if(map.getZoom() >= 13){
			document.getElementById("osm_edit_link").href = "http://www.openstreetmap.org/edit#map=" + map.getZoom() + "/" + map.getCenter().lat.toFixed(6) + "/" + map.getCenter().lng.toFixed(6);
		}
		else{
			document.getElementById("osm_edit_link").href = "http://www.openstreetmap.org/edit#map=13/" + map.getCenter().lat.toFixed(6) + "/" + map.getCenter().lng.toFixed(6);
		}
	});

	var redrawVenues = function(e) {
		// I have no experience with leaflet, so maybe this is too "hacked" on
		var inBounds = [];
		var bounds = map.getBounds();
		cluster_types.forEach(function (coinName) {
			coinLayer = clusters[coinName];
			if (!map.hasLayer(coinLayer)) {
				return;
			}
			coinLayer.eachLayer(function(layer) {
				if (bounds.contains(layer.getLatLng())) {
					right_html = '<div class="placename">' + layer.options.title + '</div>';
					var newdiv = $(right_html);
					$(newdiv).click(function() {
						// this is needed to get over clusters
						var visible = coinLayer.getVisibleParent(layer);
						visible.bindPopup(layer.getPopup()).openPopup();
					});
					// title for sorting
					inBounds.push({div:newdiv,title:layer.options.title});
				}
			});
			var marker_html;
			inBounds.sort(function(a,b){
				// no idea what will it do with chinese/arabic, but should work
				return a.title.localeCompare(b.title);
			});
			// these are not yet translated
			if (inBounds.length==0) {
				marker_html="<span data-l10n='no-visible'>No venues visible.</span>";
			} else {
				marker_html="<div class='on-map-top'> <span data-l10n='on-the-map'>Currently visible ("+inBounds.length+")</span></div><div class='leaflet-control-layers-separator'></div>";
			}
			document.getElementById('marker-list').innerHTML = marker_html;
			inBounds.forEach(function(object){
				$('#marker-list').append(object.div);
			});
			$('#marker-above').show();
		});
	};
	map.on('moveend', redrawVenues);
	map.on('overlayremove', redrawVenues);
	map.on('overlayadd', redrawVenues);

	map.locate({setView: true, maxZoom: 12});

	map.addControl( new L.Control.Search({
		url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
		jsonpParam: 'json_callback',
		propertyName: 'display_name',
		propertyLoc: ['lat','lon'],
		autoType: false,
		autoCollapse: true,
		minLength: 2,
		zoom: 13
	}) );

	// map.addControl(new L.Control.Permalink({text: 'Permalink', layers: layers, position: "none", useLocation: true}));

	// localization
	var preferredLanguage = $.cookie('lang') || window.navigator.userLanguage || window.navigator.language;
	if(knownLanguages.indexOf(preferredLanguage) > -1){
		localizeAll(preferredLanguage);
	}
	else if(knownLanguages.indexOf(preferredLanguage.split("-")[0]) > -1){
		localizeAll(preferredLanguage.split("-")[0]);
	}
	else if(knownLanguages.indexOf(preferredLanguage.replace("-","_")) > -1){
		localizeAll(preferredLanguage.replace("-","_"));
	}
	
	$.each(knownLanguages, function(i, lang){
		$('#' + lang).click(function() { $.cookie('lang', lang, { expires: 365 }); localizeAll(lang); });
	});

	$('#btn_footer_close').click(function() {
		setFooter('closed');
	});
	$('#btn_footer_open').click(function() {
		setFooter('opened');
	});
	if (localStorage) {
		setFooter(localStorage.getItem('footerState'));
	}
}

function setFooter(state) {
	if (state == 'opened') {
		$('#footer').removeClass('closed');
		$('#btn_footer_open').removeClass('opened');
	}
	else if (state == 'closed') {
		$('#footer').addClass('closed');
		$('#btn_footer_open').addClass('opened');
	}
	if (localStorage) {
		localStorage.setItem('footerState', state);
	}
}

function l(string, fallback) {
	var localized = string.toLocaleString();
	if (localized !== string) {
		return localized;
	} else {
		return fallback;
	}
}

function localizeAll(lang) {
	if (!lang) return;
	String.locale = lang;
	$('[data-l10n]').each(function(i) {
		$(this).html(l($(this).attr('data-l10n'),$(this).html()));
	});
	$('#btn_footer_close').attr('title', l('close', 'Close'));
	document.documentElement.lang = String.locale;
}
