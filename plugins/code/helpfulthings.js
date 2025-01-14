var helpfulThings = function() {

	// It'd be nice to base some recommendations on all time favourite artists. These should come lower down as they're likely to be always the same.

	var hpl = null;
	var medebug = "SPANKY";
	var trackseeds;
	var nonspotitracks;
	var artists;
	var maxwidth = 640;
	var doneonce = false;
	var current_seed = null;

	function getRecommendationSeeds() {
		debug.log(medebug, "Getting Seeds For Recommendations");
		metaHandlers.genericQuery({action: 'getrecommendationseeds', days: 180, limit: 35, top: 15},
			gotRecommendationSeeds,
			function(data) {
				debug.error(medebug,"Error Getting Seeds",data);
			}
		);
	}

	function gotRecommendationSeeds(data) {
		debug.debug(medebug, "Got Seeds For Recommendations",data);
		if (doneonce) {
			$('#hplfoldup .helpfulholder').spotifyAlbumThing('destroy');
			doneonce = false;
		}
		trackseeds = new Array();
		nonspotitracks = new Array();
		artists = new Array();
		for (var i in data) {
			if (data[i].Uri && data[i].Artistname && artists.indexOf(data[i].Artistname) == -1) {
				var m = data[i].Uri.match(/spotify:track:(.*)$/);
				if (m && m[1]) {
					data[i].id = m[1];
					trackseeds.push(data[i]);
					artists.push(data[i].Artistname);
				} else {
					debug.trace(medebug,"Didn't match Uri",data[i].Uri);
					nonspotitracks.push(data[i]);
				}
			}
		}
		if (trackseeds.length == 0 && nonspotitracks.length == 0) {
			$('#helpful_spinner').remove();
			$('#hplfoldup').append('<div class="textunderline containerbox menuitem" style="padding-left:12px;margin-top:1em"><h3 class="fixed">'
				+language.gettext('label_norecdata')+'</h3></div>');
		} else {
			helpfulThings.doStageTwo();
		}
	}

	function find_best_track(source, data) {
		if (data.tracks && data.tracks.items) {
			for (var track of data.tracks.items) {
				if (track.name.removePunctuation() == source.Title.removePunctuation()) {
					var astring = combine_spotify_artists(track.artists);
					if (astring.removePunctuation() == source.Artistname.removePunctuation()
						&& artists.indexOf(source.Artistname) == -1)
					{
						artists.push(source.Artistname);
						return track.id;
					}
				}
			};
		}
		return false;
	}

	function get_backend_info(bends) {
		let poop = cloneObject(bends);
		var lastb = poop.pop();
		var f = poop.join(', ');
		return [f + ' and ' + lastb];
	}

	return {

		open: function() {

			if (hpl == null) {
				hpl = browser.registerExtraPlugin("hpl", language.gettext("button_infoyou"), helpfulThings, 'https://fatg3erman.github.io/RompR/Music-Discovery');

				$('#hplfoldup').append('<div id="helpful_radio" class="containerbox wrap mixcontainer"></div>');

				var bends = [];
				if (player.canPlay('spotify'))
					bends.push('Spotify');

				if (player.canPlay('youtube') || player.canPlay('ytmusic'))
					bends.push('YouTube');

				if (player.canPlay('qobuz'))
					bends.push('Qobuz');

				let rradio_bends = ['RompR'].concat(bends);
				let lfmradio_bends = ['Last.FM', 'RompR'].concat(bends);

				if (player.canPlay('spotify') || player.canPlay('ytmusic') || player.canPlay('youtube') || player.canPlay('qobuz')) {
					var html = '<div class="fixed containerbox plugin_hpl_radio playable smartradio" name="recommendationsRadio">';
					html += '<img class="smallcover fixed" src="newimages/favicon-128.png" />';
					html +=	'<div class="expand alignmid plugin_hpl_radio_info"><b>'+language.gettext("label_radio_recommended")+'</b><br/>';
					html += language.gettext('label_recommenddesc', get_backend_info(rradio_bends));
					html += '</div></div>';

					html += '<div class="fixed containerbox plugin_hpl_radio playable smartradio" name="mixRadio">';
					html += '<img class="smallcover fixed" src="newimages/vinyl_record.svg" />';
					html +=	'<div class="expand alignmid plugin_hpl_radio_info"><b>'+language.gettext("label_radio_mix")+'</b><br/>';
					html += language.gettext('label_rmixdesc', get_backend_info(rradio_bends));
					html += '</div></div>';
				 	if (lastfm.isLoggedIn()) {
						html += '<div class="fixed containerbox plugin_hpl_radio playable smartradio" name="lastFMTrackRadio+1month">';
						html += '<img class="smallcover fixed" src="newimages/lastfm-icon.png" />';
						html +=	'<div class="expand alignmid plugin_hpl_radio_info"><b>'+language.gettext("label_dailymix")+'</b><br/>';
						html += language.gettext('label_dailymixdesc', get_backend_info(lfmradio_bends));
						html += '</div></div>';

						html += '<div class="fixed containerbox plugin_hpl_radio playable smartradio" name="lastFMArtistRadio+6month">';
						html += '<img class="smallcover fixed" src="newimages/lastfm-icon.png" />';
						html +=	'<div class="expand alignmid plugin_hpl_radio_info"><b>'+language.gettext("label_luckydip")+'</b><br/>';
						html += language.gettext('label_luckydipdesc', get_backend_info(lfmradio_bends));
						html += '</div></div>';
					} else {
						html += '<div class="fixed containerbox plugin_hpl_radio">';
						html += '<img class="smallcover fixed" src="newimages/lastfm-icon.png" />';
						html +=	'<div class="expand alignmid plugin_hpl_radio_info"><b>'+language.gettext("label_startshere")+'</b><br/>';
						html += language.gettext('label_goonlogin')+"</div>";
						html += '</div>';
					}
				 	if (player.canPlay('spotify')) {
						html += '<div class="fixed containerbox plugin_hpl_radio playable smartradio" name="spotiRecRadio+mix">';
						html += '<img class="smallcover fixed" src="newimages/spotify-icon.png" />';
						html +=	'<div class="expand alignmid plugin_hpl_radio_info"><b>'+language.gettext("label_spotify_mix")+'</b><br/>';
						html += language.gettext('label_spotimixdesc');
						html += '</div></div>';

						html += '<div class="fixed containerbox plugin_hpl_radio playable smartradio" name="spotiRecRadio+surprise">';
						html += '<img class="smallcover fixed" src="newimages/spotify-icon.png" />';
						html +=	'<div class="expand alignmid plugin_hpl_radio_info"><b>'+language.gettext("label_spottery_lottery")+'</b><br/>';
						html += language.gettext('label_spotiswimdesc');
						html += '</div></div>';
					}
				} else {
					var html = '<div class="fixed containerbox plugin_hpl_radio">';
					html += '<img class="smallcover fixed" src="newimages/spotify-icon.png" />';
					html +=	'<div class="expand alignmid plugin_hpl_radio_info"><b>'+language.gettext("label_getspotify")+'</b><br/>';
					html += language.gettext('label_nospotify')+"</div>";
					html += '</div>';
				}

				$('#helpful_radio').append(html);

				if (player.canPlay('spotify') || player.canPlay('youtube') || player.canPlay('ytmusic') || player.canPlay('qobuz')) {
					$('#hplfoldup').append('<div id="helpful_spinner"><i class="svg-square icon-spin6 spinner"></i></div>');
					getRecommendationSeeds();
				}

				hpl.slideToggle('fast');
				browser.goToPlugin("hpl");
				browser.rePoint();

			} else {
				browser.goToPlugin("hpl");
			}

		},

		handleClick: function(element, event) {
			if (element.hasClass('clickrefreshalbums')) {
				getRecommendationSeeds();
			} else if (element.hasClass('clickspotifywidget')) {
				var e = element;
				while (!e.hasClass('helpfulholder')) {
					e = e.parent();
				}
				e.spotifyAlbumThing('handleClick', element);
			}
		},

		close: function() {
			if (doneonce) {
				$('#hplfoldup .helpfulholder').each(function() {
					debug.trace(medebug,"Removing And Destroying",$(this).attr("id"));
					$(this).prev().remove();
					$(this).remove();
				});
			}
			doneonce = false;
			hpl = null;
		},

		doStageTwo: function() {
			if (nonspotitracks.length > 0) {
				var t = nonspotitracks[0];
				debug.trace(medebug, "Searching For Spotify ID for",t.Artistname,t.Title);
				spotify.track.search(
					'artist:'+t.Artistname+' track:'+t.Title,
					helpfulThings.gotTrackResults,
					helpfulThings.gotTrackResults,
					true
				);
			}
			helpfulThings.getMoreStuff();
		},

		gotTrackResults: function(data) {
			var t = nonspotitracks.shift();
			debug.debug(medebug,"Got Track Results for",t.Artistname,t.Title,data);
			var candidate = find_best_track(t, data);
			if (candidate !== false) {
				t.id = candidate;
				trackseeds.push(t)
			}
			helpfulThings.doStageTwo();
		},

		getMoreStuff: function() {
			if (trackseeds.length > 0) {
				current_seed = trackseeds.shift();
				var params = { limit: 12 }
				params.seed_tracks = current_seed.id;
				spotify.recommendations.getRecommendations(params, helpfulThings.gotTrackRecommendations, helpfulThings.spotiError);
			} else if (nonspotitracks.length == 0) {
				$('#helpful_spinner').remove();
				setDraggable('.helpfulholder');
				browser.rePoint();
			}
		},

		gotTrackRecommendations: function(data) {
			debug.log(medebug, "Got Track Recommendations for", current_seed.Artistname, current_seed.id);
			if (data.tracks.length == 0) {
				helpfulThings.getMoreStuff();
				return true;
			}
			$('#helpful_spinner').before('<div class="textunderline containerbox menuitem" style="padding-left:12px;margin-top:1em"><h3 class="fixed">'
			+language.gettext('because_liked',[current_seed.Artistname])+'</h3></div>');
			var holder = $('<div>', {id: 'rec_'+current_seed.id, class: 'holdingcell medium_masonry_holder helpfulholder noselection'}).insertBefore($('#helpful_spinner'));

			// Need to make sure all the album IDs are unique, since we do get duplicates

			let actualdata = [];
			for (var track of data.tracks) {
				actualdata.push(track.album);
			}

			holder.spotifyAlbumThing({
				classes: 'brick spotify_album_masonry selecotron',
				itemselector: 'brick',
				showbiogs: true,
				layoutcallback: function() { doneonce = true; helpfulThings.getMoreStuff() },
				maxwidth: maxwidth,
				is_plugin: true,
				imageclass: 'jalopy',
				data: actualdata
			});
		},

		spotiError: function(data) {
			debug.warn("HELPFULTHINGS","Spotify Error",data);
			helpfulthigs.getMoreStuff();
		}

	}
}();

pluginManager.setAction(language.gettext("button_infoyou"), helpfulThings.open);
helpfulThings.open();
