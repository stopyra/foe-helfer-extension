/*
 * **************************************************************************************
 * Copyright (C) 2022 FoE-Helper team - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the AGPL license.
 *
 * See file LICENSE.md or go to
 * https://github.com/mainIine/foe-helfer-extension/blob/master/LICENSE.md
 * for full license details.
 *
 * **************************************************************************************
 */

FoEproxy.addHandler('OtherPlayerService', 'getEventsPaginated', (data, postData) => {
    if (data.responseData['events'] && Settings.GetSetting('ShowPlayersMotivation')) {
        EventHandler.HandleEvents(data.responseData['events']);
    }
});

let EventHandler = {
	EventIDs: {},

	db: null,

	CurrentPlayerGroup: null,

	FilterMoppelEvents: true,
	FilterTavernVisits: false,
	FilterAttacks: false,
	FilterPlunders: false,
	FilterTrades: false,
	FilterGBs: false,
	FilterOthers: false,

	AllInvalidDates: [],

	MaxVisitCount : 7,

	/**
	*
	* @returns {Promise<void>}
	*/
	checkForDB: async (playerID) => {
		const DBName = `FoeHelperDB_Events_${playerID}`;

		EventHandler.db = new Dexie(DBName);

		EventHandler.db.version(2).stores({
			Events: 'eventid,date,eventtype,interactiontype,playerid,entityid,isneighbor,isguildmember,isfriend'
		});
		EventHandler.db.version(1).stores({
			Events: 'eventid,date,eventtype,playerid,entityid,isneighbor,isguildmember,isfriend'
		});

		EventHandler.db.open();
	},


	/**
	 * @param data the data to add to the events database
	 * @returns {boolean} true if the data is new in the database
	 */
	insertIntoDB: async (data) => {
		const db = EventHandler.db;
		const eventsDB = db.Events;
		const id = data.eventid;
		return db.transaction('rw', eventsDB, async () => {
			let isNew = undefined === await eventsDB.get(id);
			await db.Events.put(data);
			return isNew;
		});
	},


	HandleEvents: (Events) => {
		const inserts = [];
		let InvalidDates = [];
		for (let i = 0; i < Events.length; i++) {
			let Event = Events[i];

			let ID = Event['id'];

			if (EventHandler.EventIDs[ID]) continue; // Event schon behandelt
			EventHandler.EventIDs[ID] = ID;

			let Date = helper.dateParser.parse(Event['date']).toDate(),
				EventType = Event['type'],
				InteractionType = Event['interaction_type'],
				EntityID = Event['entity_id'];

			if (!Date) { //Datum nicht parsebar => überspringen
				InvalidDates.push(Event['date']);
				EventHandler.AllInvalidDates.push(Event['date']);
				continue;
			}

			let PlayerID = null,
				PlayerName = null,
				IsNeighbor = 0,
				IsGuildMember = 0,
				IsFriend = 0;

			if (Event['other_player']) {
				if (Event['other_player']['player_id']) PlayerID = Event['other_player']['player_id'];
				if (Event['other_player']['name']) PlayerName = Event['other_player']['name'];
				if (Event['other_player']['is_neighbor']) IsNeighbor = 1;
				if (Event['other_player']['is_guild_member']) IsGuildMember = 1;
				if (Event['other_player']['is_friend']) IsFriend = 1;
			}

			inserts.push(EventHandler.insertIntoDB({
				eventid: ID,
				date: Date,
				eventtype: EventType,
				interactiontype: InteractionType,
				playerid: PlayerID,
				playername: PlayerName,
				entityid: EntityID,
				isneighbor: IsNeighbor,
				isguildmember: IsGuildMember,
				isfriend: IsFriend,
				need: Event['need'],
				offer: Event['offer']
			}));
		}

		Promise.all(inserts).then(insertIsNewArr => {
			let count = 0;
			for (let isNew of insertIsNewArr) {
				if (isNew) count++;
			}

			if (InvalidDates.length > 0)
			{

				HTML.ShowToastMsg({
					show: 'force',
					head: i18n('Boxes.Investment.DateParseError'),
					text: HTML.i18nReplacer(i18n('Boxes.Investment.DateParseErrorDesc'), { InvalidDate: InvalidDates[0]}),
					type: 'error',
					hideAfter: 6000,
				});
            }
			else if (count === 0) {

				HTML.ShowToastMsg({
					head: i18n('Boxes.Investment.AllUpToDate'),
					text: i18n('Boxes.Investment.AllUpToDateDesc'),
					type: 'info',
					hideAfter: 6000,
				});
			}
			else {
				HTML.ShowToastMsg({
					head: i18n('Boxes.Investment.PlayerFound'),
					text: HTML.i18nReplacer(
						count === 1 ? i18n('Boxes.Investment.PlayerFoundCount') : i18n('Boxes.Investment.PlayerFoundCounter'),
						{count: count}
					),
					type: 'success',
					hideAfter: 2600,
				});
			}
		});

		if ($('#moppelhelper').length > 0) {
			EventHandler.CalcMoppelHelperBody();
		}
	},


	ShowMoppelHelper: () => {
		moment.locale(i18n('Local'));

		if ($('#moppelhelper').length === 0) {
			HTML.Box({
				id: 'moppelhelper',
				title: i18n('Boxes.MoppelHelper.Title'),
				auto_close: true,
				dragdrop: true,
				minimize: true,
				resize: true,
				settings: 'EventHandler.ShowMoppelHelperSettingsButton()'
			});

			HTML.AddCssFile('eventhandler');

			$('#moppelhelper').on('click', '.filtermoppelevents', function () {
				EventHandler.FilterMoppelEvents = !EventHandler.FilterMoppelEvents;
				EventHandler.CalcMoppelHelperTable();
			});

			$('#moppelhelper').on('click', '.filtertavernvisits', function () {
				EventHandler.FilterTavernVisits = !EventHandler.FilterTavernVisits;
				EventHandler.CalcMoppelHelperTable();
			});

			$('#moppelhelper').on('click', '.filterattacks', function () {
				EventHandler.FilterAttacks = !EventHandler.FilterAttacks;
				EventHandler.CalcMoppelHelperTable();
			});

			$('#moppelhelper').on('click', '.filterplunders', function () {
				EventHandler.FilterPlunders = !EventHandler.FilterPlunders;
				EventHandler.CalcMoppelHelperTable();
			});

			$('#moppelhelper').on('click', '.filtertrades', function () {
				EventHandler.FilterTrades = !EventHandler.FilterTrades;
				EventHandler.CalcMoppelHelperTable();
			});

			$('#moppelhelper').on('click', '.filtergbs', function () {
				EventHandler.FilterGBs = !EventHandler.FilterGBs;
				EventHandler.CalcMoppelHelperTable();
			});

			$('#moppelhelper').on('click', '.filterothers', function () {
				EventHandler.FilterOthers = !EventHandler.FilterOthers;
				EventHandler.CalcMoppelHelperTable();
			});

			// Choose Neighbors/Guildmembers/Friends
			$('#moppelhelper').on('click', '.toggle-players', function () {
				EventHandler.CurrentPlayerGroup = $(this).data('value');

				EventHandler.CalcMoppelHelperBody();
			});

			EventHandler.CalcMoppelHelperBody();

		} else {
			HTML.CloseOpenBox('moppelhelper');
			EventHandler.CurrentPlayerGroup = null;
		}
	},


	CalcMoppelHelperBody: async () => {
		let h = [];

		/* Calculation */
		if (!EventHandler.CurrentPlayerGroup) {
			if (PlayerDictFriendsUpdated) {
				EventHandler.CurrentPlayerGroup = 'Friends';
			}
			else if (PlayerDictGuildUpdated) {
				EventHandler.CurrentPlayerGroup = 'Guild';
			}
			else if (PlayerDictNeighborsUpdated) {
				EventHandler.CurrentPlayerGroup = 'Neighbors';
			}
			else {
				EventHandler.CurrentPlayerGroup = null;
			}
		}

		/* Filters */
		h.push('<div class="text-center dark-bg header"><strong class="title">' + i18n('Boxes.MoppelHelper.HeaderWarning') + '</strong><br></div>');
		h.push('<div class="dark-bg"><div class="dropdown" style="float:right">');
        h.push('<input type="checkbox" class="dropdown-checkbox" id="event-checkbox-toggle"><label class="dropdown-label game-cursor" for="event-checkbox-toggle">' + i18n('Boxes.Infobox.Filter') + '</label><span class="arrow"></span>');
        h.push('<ul>');
        h.push('<li><label class="game-cursor"><input type="checkbox" data-type="auction" class="filtermoppelevents game-cursor" ' + (EventHandler.FilterMoppelEvents ? 'checked' : '') + '> ' + i18n('Boxes.MoppelHelper.MoppelEvents') + '</label></li>');
        h.push('<li><label class="game-cursor"><input type="checkbox" data-type="gex" class="filtertavernvisits game-cursor" ' + (EventHandler.FilterTavernVisits ? 'checked' : '') + '> ' + i18n('Boxes.MoppelHelper.TavernVisits') + '</label></li>');
        h.push('<li><label class="game-cursor"><input type="checkbox" data-type="gbg" class="filterattacks game-cursor" ' + (EventHandler.FilterAttacks ? 'checked' : '') + '> ' + i18n('Boxes.MoppelHelper.Attacks') + '</label></li>');
        h.push('<li><label class="game-cursor"><input type="checkbox" data-type="trade" class="filterplunders game-cursor" ' + (EventHandler.FilterPlunders ? 'checked' : '') + '> ' + i18n('Boxes.MoppelHelper.Plunders') + '</label></li>');
        h.push('<li><label class="game-cursor"><input type="checkbox" data-type="level" class="filtertrades game-cursor" ' + (EventHandler.FilterTrades ? 'checked' : '') + '> ' + i18n('Boxes.MoppelHelper.Trades') + '</label></li>');
        h.push('<li><label class="game-cursor"><input type="checkbox" data-type="msg" class="filtergbs game-cursor" ' + (EventHandler.FilterGBs ? 'checked' : '') + '> ' + i18n('Boxes.MoppelHelper.GBs') + '</label></li>');
        //h.push('<li><label class="game-cursor"><input type="checkbox" data-type="msg" class="filterothers game-cursor" ' + (EventHandler.FilterOthers ? 'checked' : '') + '> ' + i18n('Boxes.MoppelHelper.Others') + '</label></li>');
        h.push('</ul>');
		h.push('</div>');

		h.push('<div class="tabs"><ul class="horizontal">');

		h.push('<li class="' + (!PlayerDictNeighborsUpdated ? 'disabled' : '') + ' ' + (EventHandler.CurrentPlayerGroup === 'Neighbors' ? 'active' : '') + '"><a class="toggle-players" data-value="Neighbors"><span>' + i18n('Boxes.MoppelHelper.Neighbors') + '</span></a></li>');
		h.push('<li class="' + (!PlayerDictGuildUpdated ? 'disabled' : '') + ' ' + (EventHandler.CurrentPlayerGroup === 'Guild' ? 'active' : '') + '"><a class="toggle-players" data-value="Guild"><span>' + i18n('Boxes.MoppelHelper.GuildMembers') + '</span></a></li>');
		h.push('<li class="' + (!PlayerDictFriendsUpdated ? 'disabled' : '') + ' ' + (EventHandler.CurrentPlayerGroup === 'Friends' ? 'active' : '') + '"><a class="toggle-players" data-value="Friends"><span>' + i18n('Boxes.MoppelHelper.Friends') + '</span></a></li>');

		h.push('</ul></div></div>');

		h.push('<table id="moppelhelperTable" class="foe-table sortable-table exportable">');
		h.push('</table>');

		await $('#moppelhelperBody').html(h.join(''))
		EventHandler.CalcMoppelHelperTable();
		$('.sortable-table').tableSorter();
	},


	/**
	 * Updates the Motivation Helper table
	 *
	 * @returns {Promise<void>}
	 * @constructor
	 */
	CalcMoppelHelperTable: async () => {
		let h = [];

		let PlayerList = [];
		if (EventHandler.CurrentPlayerGroup === 'Friends') {
			if (!PlayerDictFriendsUpdated) {
				h.push('<div class="text-center"><strong class="bigerror">' + i18n('Boxes.MoppelHelper.FriendsSocialTabTT') + '</strong></div>');
				await $('#moppelhelperTable').html(h.join(''))
				return;
            }
			PlayerList = Object.values(PlayerDict).filter(obj => (obj['IsFriend'] === true));
		}
		else if (EventHandler.CurrentPlayerGroup === 'Guild') {
			if (!PlayerDictGuildUpdated) {
				h.push('<div class="text-center"><strong class="bigerror">' + i18n('Boxes.MoppelHelper.GuildSocialTabTT') + '</strong></div>');
				await $('#moppelhelperTable').html(h.join(''))
				return;
			}
			PlayerList = Object.values(PlayerDict).filter(obj => (obj['IsGuildMember'] === true));
		}
		else if (EventHandler.CurrentPlayerGroup === 'Neighbors') {
			if (!PlayerDictNeighborsUpdated) {
				h.push('<div class="text-center"><strong class="bigerror">' + i18n('Boxes.MoppelHelper.NeighborsSocialTabTT') + '</strong></div>');
				await $('#moppelhelperTable').html(h.join(''))
				return;
			}
			PlayerList = Object.values(PlayerDict).filter(obj => (obj['IsNeighbor'] === true));
		}

		PlayerList = PlayerList.sort(function (a, b) {
			return b['Score'] - a['Score'];
		});

		h.push('<tbody class="moppelhelper">');
		h.push('<tr class="sorter-header">');
		h.push('<th columnname="Rank" class="is-number ascending" data-type="moppelhelper">' + i18n('Boxes.MoppelHelper.Rank') + '</th>');
		h.push('<th></th>');
		h.push('<th columnname="Name" data-type="moppelhelper">' + i18n('Boxes.MoppelHelper.Name') + '</th>');
		h.push('<th columnname="Era" data-type="moppelhelper">' + i18n('Boxes.MoppelHelper.Era') + '</th>');
		h.push('<th columnname="Points" class="is-number" data-type="moppelhelper">' + i18n('Boxes.MoppelHelper.Points') + '</th>');

		for (let i = 0; i < EventHandler.MaxVisitCount; i++)
		{
			h.push('<th columnname="Event'+ (i+1) +'" class="is-number" data-type="moppelhelper">' + i18n('Boxes.MoppelHelper.Event') + (i + 1) + '</th>');
		}

		h.push('</tr>');

		let HasGuildPermission = ((ExtGuildPermission & GuildMemberStat.GuildPermission_Leader) > 0 || (ExtGuildPermission & GuildMemberStat.GuildPermission_Founder) > 0);
		for (let i = 0; i < PlayerList.length; i++)
		{
			let Player = PlayerList[i];

			if (Player['IsSelf']) continue;

			let Visits = await EventHandler.db['Events'].where('playerid').equals(Player['PlayerID']).toArray();
			Visits = Visits.filter(function (obj) {
				if (!obj['date']) return false; //Corrupt values in DB => skip

				let EventType = EventHandler.GetEventType(obj);
				if (EventType === 'MoppelEvent') {
					return EventHandler.FilterMoppelEvents;
				}
				else if (EventType === 'TavernVisit') {
					return EventHandler.FilterTavernVisits;
				}
				else if (EventType === 'Attack') {
					return EventHandler.FilterAttacks;
				}
				else if (EventType === 'Plunder') {
					return EventHandler.FilterPlunders;
				}
				else if (EventType === 'Trade') {
					return EventHandler.FilterTrades;
				}
				else if (EventType === 'GB') {
					return EventHandler.FilterGBs;
				}
				else {
					return EventHandler.FilterOthers;
				}
			});

			Visits = Visits.sort(function (a, b) {
				return b['date'] - a['date'];
			});

			h.push('<tr>');
			h.push('<td class="is-number" data-number="' + (i + 1) + '">#' + (i + 1) + '</td>');

			h.push(`<td><img style="max-width: 22px" src="${MainParser.InnoCDN + 'assets/shared/avatars/' + (MainParser.PlayerPortraits[Player['Avatar']] || 'portrait_433')}.jpg" alt="${Player['PlayerName']}"></td>`);

			h.push('<td style="white-space:nowrap;text-align:left;" data-text="' + Player['PlayerName'].toLowerCase().replace(/[\W_ ]+/g, "") + '">');

			if (EventHandler.CurrentPlayerGroup === 'Friends' || (EventHandler.CurrentPlayerGroup === 'Guild' && HasGuildPermission)) {
				h.push(`<img class="small" src="${extUrl}js/web/guildmemberstat/images/act_${Player['Activity']}.png">`);
            }
			h.push(MainParser.GetPlayerLink(Player['PlayerID'], Player['PlayerName']));

			h.push(`<td data-text="${i18n('Eras.' + Technologies.Eras[Player['Era']])}">${i18n('Eras.' + Technologies.Eras[Player['Era']])}</td>`);

			h.push('<td class="is-number" data-number="' + Player['Score'] + '">' + HTML.Format(Player['Score']) + '</td>');

			for (let j = 0; j < EventHandler.MaxVisitCount; j++)
			{
				if (j < Visits.length)
				{
					let Seconds = (MainParser.getCurrentDateTime() - Visits[j]['date'].getTime()) / 1000;
					let Days = Seconds / 86400; //24*3600
					let StrongColor = (Days < 3 * (j + 1) ? HTML.GetColorGradient(Days, 0, 3 * (j + 1), '00ff00', 'ffff00') : HTML.GetColorGradient(Days, 3 * (j + 1), 7 * (j + 1), 'ffff00', 'ff0000'));
					let FormatedDays = HTML.i18nReplacer(i18n('Boxes.MoppelHelper.Days'), { 'days': Math.round(Days) });
					let EventType = EventHandler.GetEventType(Visits[j]);

					h.push('<td style="white-space:nowrap" class="events-image" data-number="' + Days + '"><span class="events-sprite-50 sm ' + EventType + '"></span><strong style="color:#' + StrongColor + '">' + FormatedDays + '</strong></td>');
				}
				else {
					h.push('<td class="is-date" data-number="999999999"><strong style="color:#ff0000">' + i18n('Boxes.MoppelHelper.Never') + '</strong></td>');
				}
			}
			h.push('</tr>');
		}

		h.push('</tbody>');

		await $('#moppelhelperTable').html(h.join(''))
    },


	/**
	 * Return the type of the event
	 *
	 * @param Event
	 * @returns {string}
	 * @constructor
	 */
	GetEventType: (Event) => {
		if (Event['eventtype'] === 'social_interaction' && (Event['interactiontype'] === 'motivate' || Event['interactiontype'] === 'polish' || Event['interactiontype'] === 'polivate_failed')) return 'MoppelEvent';
		if (Event['eventtype'] === 'friend_tavern_sat_down') return 'TavernVisit';
		if (Event['eventtype'] === 'battle') return 'Attack';
		if (Event['eventtype'] === 'social_interaction' && Event['interactiontype'] === 'plunder') return 'Plunder';
		if (Event['eventtype'] === 'trade_accepted') return 'Trade';
		if (Event['eventtype'] === 'great_building_built' || Event['eventtype'] === 'great_building_contribution') return 'GB';
		return 'Other';
	},


	/**
	*
	*/
	ShowMoppelHelperSettingsButton: () => {
		let h = [];
		h.push(`<p class="text-center"><button class="btn btn-default" onclick="HTML.ExportTable($('#moppelhelperBody').find('.foe-table.exportable'), 'csv', 'MoppelHelper${EventHandler.CurrentPlayerGroup}')">${i18n('Boxes.General.ExportCSV')}</button></p>`);
		h.push(`<p class="text-center"><button class="btn btn-default" onclick="HTML.ExportTable($('#moppelhelperBody').find('.foe-table.exportable'), 'json', 'MoppelHelper${EventHandler.CurrentPlayerGroup}')">${i18n('Boxes.General.ExportJSON')}</button></p>`);

		$('#moppelhelperSettingsBox').html(h.join(''));
	},


	/**
	*
	*/
	ShowMoppelHelperSettingsButton: () => {
		let h = [];
		h.push(`<p class="text-center"><button class="btn btn-default" onclick="HTML.ExportTable($('#moppelhelperBody').find('.foe-table.exportable'), 'csv', 'MoppelHelper${EventHandler.CurrentPlayerGroup}')">${i18n('Boxes.General.ExportCSV')}</button></p>`);
		h.push(`<p class="text-center"><button class="btn btn-default" onclick="HTML.ExportTable($('#moppelhelperBody').find('.foe-table.exportable'), 'json', 'MoppelHelper${EventHandler.CurrentPlayerGroup}')">${i18n('Boxes.General.ExportJSON')}</button></p>`);

		$('#moppelhelperSettingsBox').html(h.join(''));
	}
};
