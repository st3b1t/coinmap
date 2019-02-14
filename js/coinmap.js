var knownLanguages = ["cz","de","en","it","jp","pt_br","ru","sk"];

function coinmap() {

	var tileOSM = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: 'Data &copy; by <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>.',
		maxZoom: 18
	});

	var tileGoogleRoadmap = new L.Google('ROADMAP');

	var tileGoogleSatellite = new L.Google('SATELLITE');

	var tileGoogleHybrid = new L.Google('HYBRID');

	var tileGoogleTerrain = new L.Google('TERRAIN');

	var coin_clusters = {};
	var coins = ["Bitcoin"];
	for (var i = 0; i < coins.length; i++) {
		coin_clusters[coins[i]] = new L.MarkerClusterGroup({showCoverageOnHover: false, maxClusterRadius: 64});
	}

	window.total_count = 0;
	for (var i = 0; i < coins.length; i++) {
		coinmap_populate_overpass(coin_clusters[coins[i]], coins[i]);
	}
	// var map_layers = [tileMapQuest];
	var map_layers = [tileOSM];
	map_layers.push(coin_clusters[coins[0]]); // enable just first coin

	var map = L.map('map', {
		center: [0, 0],
		zoom: 3,
		layers: map_layers,
		worldCopyJump: true
	});

	var layers = L.control.layers({
		"OpenStreetMap": tileOSM,
		"Google Roadmap": tileGoogleRoadmap,
		"Google Satellite": tileGoogleSatellite,
		"Google Hybrid": tileGoogleHybrid,
		"Google Terrain": tileGoogleTerrain,
	}, coin_clusters, {
		collapsed: false
	}).addTo(map);

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
		coins.forEach(function (coinName) {
			coinLayer = coin_clusters[coinName];
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
