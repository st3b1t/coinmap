function coinmap_populate_overpass(clusters) {
	return $.getJSON('data/data-overpass-bitcoin.json', function(data) {
	    let i = 0;
		$.each(data, function(index, element) {
		    setTimeout(() => {
                var lat = element['lat'];
                var lon = element['lon'];
                var title = element['title'];
                var popup = '<b>' + element['title'] + '</b> <a href="http://openstreetmap.org/browse/' + element['type'] + '/' + element['id'] + '" target="_blank">*</a><hr/>';
                if (element['addr']) {
                    popup += element['addr'] + '<br/>';
                }
                if (element['city']) {
                    popup += element['city'] + '<br/>';
                }
                if (element['country']) {
                    popup += element['country'] + '<br/>';
                }
                popup += '<hr/>';
                if (element['web']) {
                    popup += '<span data-l10n="website-">website</span>: <a href="' + element['web'] + '" target="_blank">' + element['web'] + '</a><br/>';
                }
                if (element['email']) {
                    popup += '<span data-l10n="email">e-mail</span>: <a href="mailto:' + element['email'] + '" target="_blank">' + element['email'] + '</a><br/>';
                }
                if (element['phone']) {
                    popup += '<span data-l10n="phone-">phone</span>: ' + element['phone'] + '<br/>';
                }
                if (element['desc']) {
                    popup += element['desc'] + '<br/>';
                }
                var icon = element['icon'];
                var promoted = false;
                if (promoted) {
                    icon += '.p';
                }
                icon = window.coinmap_icons[icon];

                if (element['icon'] === "money_atm") {
                    L.marker([lat, lon], {"title": title, "icon": icon}).bindPopup(popup).addTo(clusters['ATMs']);
                } else {
                    L.marker([lat, lon], {"title": title, "icon": icon}).bindPopup(popup).addTo(clusters['Venues']);
                }
                L.marker([lat, lon], {"title": title, "icon": icon}).bindPopup(popup).addTo(clusters['All']);

                // Calculating loading percentage using external variable i and setTimeout function
                // to make it to work and to be displayed. Otherwise it won't work!
                i++;
                document.getElementById("loading-progress").innerHTML = String(Math.round(index/data.length * 100));
                if (i >= data.length) {
                    $('#loading').hide();
                    $('#container').show();
                }
            });
		});
	});
}
