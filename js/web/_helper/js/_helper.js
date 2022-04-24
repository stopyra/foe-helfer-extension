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

/*
Example:

let peoples = [
    {name: 'Jean', lastname: 'Rodrigues', points: 30},
    {name: 'Sara', lastname: 'Hope', points: 30},
    {name: 'Igor', lastname: 'Leroy', points: 25},
    {name: 'Foo', lastname: 'Bar', points: 55}
];

// sort this list by points, if points is equal, sort by name.
let ranking = helper.arr.multisort(peoples, ['points', 'name'], ['DESC','ASC']);

*/

if( typeof helper == 'undefined' ) {
	var helper = { } ;
}

helper.str = {
	/**
	 * Function to copy string to clipboard
	 *
	 * <a href="/param">@param</a> {string} [textToCopy] Source string
	 */
	copyToClipboard: async(textToCopy) => {
		if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
			return navigator.clipboard.writeText(textToCopy);
		} else {
			return new Promise(async (resolve) => {
				let copyFrom = $('<textarea/>');
				copyFrom.text(textToCopy);
				$('body').append(copyFrom);
				copyFrom.select();
				document.execCommand('copy');
				copyFrom.remove();
				resolve();
			});
		}
	},

	copyToClipboardLegacy: (textToCopy) => {
		let copyFrom = $('<textarea/>');
		copyFrom.text(textToCopy);
		$('body').append(copyFrom);
		copyFrom.select();
		document.execCommand('copy');
		copyFrom.remove();
    },
};

helper.arr = {
	/**
	 * Function to sort multidimensional array
	 *
	 * <a href="/param">@param</a> {array} [arr] Source array
	 * <a href="/param">@param</a> {array} [columns] List of columns to sort
	 * <a href="/param">@param</a> {array} [order_by] List of directions (ASC, DESC)
	 * @returns {array}
	 */
	multisort: function(arr, columns, order_by)
	{
		if(typeof columns == 'undefined') {
			columns = [];
			for(let x = 0; x < arr[0].length; x++) {
				columns.push(x);
			}
		}

		if(typeof order_by == 'undefined') {
			order_by = [];
			for(let x = 0; x < arr[0].length; x++) {
				order_by.push('ASC');
			}
		}

		function multisort_recursive(a, b, columns, order_by, index) {
			var direction = order_by[index] === 'DESC' ? 1 : 0;

			var is_numeric = !isNaN(+a[columns[index]] - +b[columns[index]]);


			var x = is_numeric ? +a[columns[index]] : a[columns[index]].toLowerCase();
			var y = is_numeric ? +b[columns[index]] : b[columns[index]].toLowerCase();



			if(x < y) {
				return direction === 0 ? -1 : 1;
			}

			if(x === y)  {
				return columns.length-1 > index ? multisort_recursive(a, b, columns, order_by,index+1) : 0;
			}

			return direction === 0 ? 1 : -1;
		}

		return arr.sort(function(a, b) {
			return multisort_recursive(a, b, columns, order_by,0);
		});
	}
};

helper.permutations = (()=>{
	const permutations = function *(elements) {
		if (elements.length === 1) {
			yield elements;
		} else {
			let [first, ...rest] = elements;
			for (let perm of permutations(rest)) {
				for (let i = 0; i < elements.length; i++) {
					let start = perm.slice(0, i);
					let rest = perm.slice(i);
					yield [...start, first, ...rest];
				}
			}
		}
	};
	return permutations;
})();

helper.dateParser = {
	/**
	 * Returns the shapes for regex function
	 *
	 * @param lng
	 * @returns {{yesterday: RegExp, sunday: RegExp, saturday: RegExp, tuesday: RegExp, today: RegExp, wednesday: RegExp, thursday: RegExp, friday: RegExp, monday: RegExp}|*}
	 * @constructor
	 */
	dateShapes: function(lng) {
		const LngRegEx = {
			de: {
				today	    : /heute um (?<h>[012]?\d):(?<m>[0-5]?\d) Uhr/g,
				yesterday	: /gestern um (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday 	  	: /Montag um (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday  	: /Dienstag um (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday 	: /Mittwoch um (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday  	: /Donnerstag um (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday    	: /Freitag um (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday  	: /Samstag um (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday   	: /Sonntag um (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			en: {
				today     : /today at (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				yesterday : /yesterday at (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				monday    : /Monday at (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				tuesday   : /Tuesday at (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				wednesday : /Wednesday at (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				thursday  : /Thursday at (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				friday    : /Friday at (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				saturday  : /Saturday at (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				sunday    : /Sunday at (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
			},
			pt: {
				today     : /hoje às (?<h>[012]?\d):(?<m>[0-5]?\d)( horas)?/g,
				yesterday : /ontem pelas (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday    : /Segunda-feira pelas (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday   : /Terça-feira pelas (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday : /Quarta-feira pelas (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday  : /Quinta-feira pelas (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday    : /Sexta-feira pelas (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday  : /Sábado pelas (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday    : /Domingo pelas (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			br : {
				today     : /hoje às (?<h>[012]?\d):(?<m>[0-5]?\d)( horas)?/g,
				yesterday : /ontem às (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday    : /Segunda-feira às (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday   : /Terça-feira às (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday : /Quarta-feira às (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday  : /Quinta-feira às (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday    : /Sexta-feira às (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday  : /Sábado às (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday    : /Domingo às (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			fr: {
				today     : /aujourd\'hui à (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				yesterday : /hier à (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday    : /Lundi à (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday   : /Mardi à (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday : /Mercredi à (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday  : /Jeudi à (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday    : /Vendredi à (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday  : /Samedi à (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday    : /Dimanche à (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			it: {
				today     : /oggi alle (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				yesterday : /ieri alle (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday    : /Lunedì alle (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday   : /Martedì alle (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday : /Mercoledì alle (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday  : /Giovedì alle (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday    : /Venerdì alle (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday  : /Sabato alle (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday    : /Domenica alle (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			pl: {
				today     : /dzisiaj o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				yesterday : /wczoraj o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday    : /Poniedziałek o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday   : /Wtorek o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday : /Środa o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday  : /Czwartek o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday    : /Piątek o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday  : /Sobota o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday    : /Niedziela o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			ro: {
				today     : /astăzi la ora (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				yesterday : /ieri la (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday    : /Luni la (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday   : /Marți la (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday : /Miercuri la (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday  : /Joi la (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday    : /Vineri la (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday  : /Sâmbătă la (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday    : /Duminică la (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			nl: {
				today     : /vandaag om (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				yesterday : /gisteren om (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday    : /Maandag om (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday   : /Dinsdag om (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday : /Woensdag om (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday  : /Donderdag om (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday    : /Vrijdag om (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday  : /Zaterdag om (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday    : /Zondag om (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			gr: {
				today     : /σήμερα στις (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				yesterday : /χτες στις (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				monday    : /Δευτέρα στις (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				tuesday   : /Τρίτη στις (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				wednesday : /Τετάρτη στις (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				thursday  : /Πέμπτη στις (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				friday    : /Παρασκευή στις (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				saturday  : /Σάββατο στις (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
				sunday    : /Κυριακή στις (?<h>[012]?\d):(?<m>[0-5]?\d) (?<half>(a|p)m)/g,
			},
			hu: {
				today     : /ma (?<h>[012]?\d):(?<m>[0-5]?\d) órakor/g,
				yesterday : /tegnap, ekkor: (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday    : /Hétfő, ekkor: (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday   : /Kedd, ekkor: (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday : /Szerda, ekkor: (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday  : /Csütörtök, ekkor: (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday    : /Péntek, ekkor: (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday  : /Szombat, ekkor: (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday    : /Vasárnap, ekkor: (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			ru: {
				today     : /сегодня, в (?<h>[012]?\d):(?<m>[0-5]?\d) /g,
				yesterday : /вчера в (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday    : /Понедельник в (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday   : /Вторник в (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday : /Среда в (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday  : /Четверг в (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday    : /Пятница в (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday  : /Суббота в (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday    : /Воскресенье в (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			tr: {
				today: /bugün (?<h>[012]?\d):(?<m>[0-5]?\d) itibariyle/g,
				yesterday: /dün (?<h>[012]?\d):(?<m>[0-5]?\d) saatinde/g,
				monday: /Pazartesi, (?<h>[012]?\d):(?<m>[0-5]?\d) saatinde/g,
				tuesday: /Salı, (?<h>[012]?\d):(?<m>[0-5]?\d) saatinde/g,
				wednesday: /Çarşamba, (?<h>[012]?\d):(?<m>[0-5]?\d) saatinde/g,
				thursday: /Perşembe, (?<h>[012]?\d):(?<m>[0-5]?\d) saatinde/g,
				friday: /Cuma, (?<h>[012]?\d):(?<m>[0-5]?\d) saatinde/g,
				saturday: /Cumartesi, (?<h>[012]?\d):(?<m>[0-5]?\d) saatinde/g,
				sunday: /Pazar, (?<h>[012]?\d):(?<m>[0-5]?\d) saatinde/g,
			},
			es: {
				today: /hoy a la\/s (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				yesterday: /ayer a las (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday: /Lunes a las (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday: /Martes a las (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday: /Miércoles a las (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday: /Jueves a las (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday: /Viernes a las (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday: /Sábado a las (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday: /Domingo a las (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			cz: {
				today: /dnes v (?<h>[012]?\d):(?<m>[0-5]?\d) hod/g, //Old Format: /dnes v\xC2\xA0(?<h>[012]?\d):(?<m>[0-5]?\d)\xC2\xA0hod/g
				yesterday: /včera v (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday: /Pondělí v (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday: /Úterý v (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday: /Středa v (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday: /Čtvrtek v (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday: /Pátek v (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday: /Sobota v (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday: /Neděle v (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			sk: {
				today: /dnes o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				yesterday: /včera o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday: /Pondelok o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday: /Utorok o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday: /Streda o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday: /Štvrtok o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday: /Piatok o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday: /Sobota o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday: /Nedeľa o (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			se: {
				today: /idag kl (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				yesterday: /i går kl (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday: /Måndag kl (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday: /Tisdag kl (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday: /Onsdag kl (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday: /Torsdag kl (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday: /Fredag kl (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday: /Lördag kl (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday: /Söndag kl (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			th: {
				today: /วันนี้ เวลา (?<h>[012]?\d):(?<m>[0-5]?\d) น./g,
				yesterday: /เมื่อวาน ตอน (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				monday: /จันทร์ ตอน (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				tuesday: /อังคาร ตอน (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				wednesday: /พุธ ตอน (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				thursday: /พฤหัสบดี ตอน (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				friday: /ศุกร์ ตอน (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				saturday: /เสาร์ ตอน (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
				sunday: /อาทิตย์ ตอน (?<h>[012]?\d):(?<m>[0-5]?\d)/g,
			},
			dk: {
				today: /i dag kl\. (?<h>[012]?\d)\.(?<m>[0-5]?\d)/g,
				yesterday: /i går klokken (?<h>[012]?\d)\.(?<m>[0-5]?\d)/g,
				monday: /Mandag klokken (?<h>[012]?\d)\.(?<m>[0-5]?\d)/g,
				tuesday: /Tirsdag klokken (?<h>[012]?\d)\.(?<m>[0-5]?\d)/g,
				wednesday: /Onsdag klokken (?<h>[012]?\d)\.(?<m>[0-5]?\d)/g,
				thursday: /Torsdag klokken (?<h>[012]?\d)\.(?<m>[0-5]?\d)/g,
				friday: /Fredag klokken (?<h>[012]?\d)\.(?<m>[0-5]?\d)/g,
				saturday: /Lørdag klokken (?<h>[012]?\d)\.(?<m>[0-5]?\d)/g,
				sunday: /Søndag klokken (?<h>[012]?\d)\.(?<m>[0-5]?\d)/g,
			},
			fi: {
				today: /tänään klo (?<h>[012]?\d).(?<m>[0-5]?\d)/g,
				yesterday: /eilen kello (?<h>[012]?\d).(?<m>[0-5]?\d)/g,
				monday: /Maanantai kello (?<h>[012]?\d).(?<m>[0-5]?\d)/g,
				tuesday: /Tiistai kello (?<h>[012]?\d).(?<m>[0-5]?\d)/g,
				wednesday: /Keskiviikko kello (?<h>[012]?\d).(?<m>[0-5]?\d)/g,
				thursday: /Torstai kello (?<h>[012]?\d).(?<m>[0-5]?\d)/g,
				friday: /Perjantai kello (?<h>[012]?\d).(?<m>[0-5]?\d)/g,
				saturday: /Lauantai kello (?<h>[012]?\d).(?<m>[0-5]?\d)/g,
				sunday: /Sunnuntai kello (?<h>[012]?\d).(?<m>[0-5]?\d)/g,
			},
		};

		if(LngRegEx[lng]){
			return LngRegEx[lng];
		}

		// mapper
		switch(lng){
			case 'us' : return LngRegEx['en'];
			case 'xs' : return LngRegEx['en'];
			case 'zz' : return LngRegEx['en'];
			case 'ar' : return LngRegEx['es'];
			case 'mx' : return LngRegEx['es'];
			case 'no' : return LngRegEx['dk'];
		}
	},

	parse: function(DateString) {
		// Czech today contains &nbsp (0x00A0) => replace with blank
		let NBSPRegex = new RegExp(String.fromCharCode(160), "g");
		DateString = DateString.replace(NBSPRegex, " ");

		let OldLocale = moment.locale();
		moment.locale('en-US');

		const lang = ExtWorld.substr(0, 2);
		const matcher = this.dateShapes(lang);

		const capitalize = (s) => {
			if (typeof s !== 'string') return ''
			return s.charAt(0).toUpperCase() + s.slice(1)
		}

		// Fallback @Todo: Was könnte dann passieren?
		if(!matcher){
			return undefined;
		}

		for(let day in matcher)
		{
			if(!matcher.hasOwnProperty(day)) continue;

			let match = null;

			while ((match = matcher[day].exec(DateString)) !== null)
			{
				// this is necessary to avoid infinite loops with zero-width matches
				if (match.index === matcher[day].lastIndex)
				{
					matcher[day].lastIndex++;
				}

				let h = parseInt(match['groups']['h']);
				let m = parseInt(match['groups']['m']);

				// get the correct 24h time
				if(match['groups']['half'])
				{
					if(match['groups']['half'] === 'am' && h === 12)
					{
						h = 12;
					}
					else if(match['groups']['half'] === 'am' && h !== 12)
					{
						h += 12;
					}
				}

				// get reference day
				let refDate = null;

				switch(day){
					case 'today':
						refDate = moment();
						break;

					case 'yesterday':
						refDate = moment().subtract(1, 'day');
						break;

					default:
						refDate = moment().day(capitalize(day));
						if (refDate.isAfter(MainParser.getCurrentDate())) refDate = refDate.subtract(7 * 86400000); //Date is in the future => subtract 1 week
				}

				refDate.set({
					hour:   h,
					minute: m,
					second: 0
				})

				moment.locale(OldLocale);

				return moment( refDate, moment.defaultFormat);
			}
		}

		return undefined;
	}
};


let HTML = {

	customFunctions: [],
	IsReversedFloatFormat: undefined,

	/**
	 * Creates an HTML box in the DOM
	 *
	 * id
	 * title
	 * ask = null
	 * auto_close = true
	 * onlyTitle = title
	 * dragdrop = true
	 * resize = false
	 * speaker = false
	 * minimize = true
	 * saveCords = true
	 *
	 * @param args
	 */
	Box: (args) => {

		let title = $('<span />').addClass('title').html(args['title']);

		if (args['onlyTitle'] !== true) {
			title = $('<span />').addClass('title').html((extVersion.indexOf("beta") > -1 ? '(Beta) ': '') + args['title'] + ' <small><em> - FoE Helper</em></small>');
		}

		let close = $('<span />').attr('id', args['id'] + 'close').addClass('window-close'),

			head = $('<div />').attr('id', args['id'] + 'Header').attr('class', 'window-head').append(title),
			body = $('<div />').attr('id', args['id'] + 'Body').attr('class', 'window-body'),
			div = $('<div />').attr('id', args['id']).attr('class', 'window-box open').append(head).append(body).hide(),
			cords = localStorage.getItem(args['id'] + 'Cords');


		if (args['auto_close'] !== false) {
			head.append(close);
		}

		// Minimierenbutton
		if (args['minimize']) {
			let min = $('<span />').addClass('window-minimize');
			min.insertAfter(title);
		}

		// insert a wrench icon
		// set a click event on it
		if (args['settings']) {
			let set = $('<span />').addClass('window-settings').attr('id', `${args['id']}-settings`);
			set.insertAfter(title);

			if (typeof args['settings'] !== 'boolean') {
				HTML.customFunctions[`${args['id']}Settings`] = args['settings'];
			}
		}

		if (args['popout']) {
			let set = $('<span />').addClass('window-settings').attr('id', `${args['id']}-popout`);
			set.insertAfter(title);

			if (typeof args['popout'] !== 'boolean') {
				HTML.customFunctions[`${args['id']}PopOut`] = args['popout'];
			}
		}

		if (args['map']) {
			let set = $('<span />').addClass('window-map').attr('id', `${args['id']}-map`);
			set.insertAfter(title);

			if (typeof args['map'] !== 'boolean') {
				HTML.customFunctions[`${args['id']}Map`] = args['map'];
			}
		}

		// Lautsprecher für Töne
		if (args['speaker']) {
			let spk = $('<span />').addClass('window-speaker').attr('id', args['speaker']);
			spk.insertAfter(title);

			$('#' + args['speaker']).addClass(localStorage.getItem(args['speaker']));
		}

		// es gibt gespeicherte Koordinaten
		if (cords) {
			let c = cords.split('|');

			// Verhindere, dass Fenster außerhalb plaziert werden
			div.offset({ top: Math.min(parseInt(c[0]), window.innerHeight - 50), left: Math.min(parseInt(c[1]), window.innerWidth - 100) });
		}

		// Ein Link zu einer Seite
		if (args['ask']) {
			div.find(title).after($('<span />').addClass('window-ask').attr('data-url', args['ask']));
		}

		// wenn Box im DOM, verfeinern
		$('body').append(div).promise().done(function () {

			// necessary delay hack
			setTimeout(() => {
				HTML.BringToFront(div);
			}, 300);


			if (args['auto_close']) {
				$(`#${args.id}`).on('click', `#${args['id']}close`, function () {

					// remove settings box if open
					$(`#${args.id}`).find('.settingsbox-wrapper').remove();

					$('#' + args['id']).fadeToggle('fast', function () {
						$(this).remove();
					});
				});
			}

			if (args['ask']) {
				$(`#${args.id}`).on('click', '.window-ask', function () {
					window.open($(this).data('url'), '_blank');
				});
			}

			if (args['dragdrop']) {
				HTML.DragBox(document.getElementById(args['id']), args['saveCords']);

				// is there a callback function?
				if (typeof args['dragdrop'] !== 'boolean') {
					HTML.customFunctions[args['id']] = args['dragdrop'];
				}
			}

			// is there a callback function?
			if (args['settings']) {
				if (typeof args['settings'] !== 'boolean') {
					$(`#${args['id']}`).on('click', `#${args['id']}-settings`, function () {

						// exist? remove!
						if ($(`#${args['id']}SettingsBox`).length > 0) {
							$(`#${args['id']}SettingsBox`).fadeToggle('fast', function () {
								$(this).remove();
							});
						}

						// create a new one
						else {
							HTML.SettingsBox(args['id']);
						}
					});
				}
			}

			if (args['popout']) {
				if (typeof args['popout'] !== 'boolean') {
					$(`#${args['id']}`).on('click', `#${args['id']}-popout`, function () {
						HTML.PopOutBox(args['id']);
					});
				}
			}

			if (args['map']) {
				if (typeof args['map'] !== 'boolean') {
					$(`#${args['id']}`).on('click', `#${args['id']}-map`, function () {

						// exist? remove!
						if ($(`#${args['id']}MapBox`).length > 0) {
							$(`#${args['id']}MapBox`).fadeToggle('fast', function () {
								$(this).remove();
							});
						}

						// create a new one
						else {
							HTML.MapBox(args['id']);
						}
					});
				}
			}

			if (args['resize']) {
				HTML.Resizeable(args['id'], args['keepRatio']);
			}

			if (args['minimize']) {
				HTML.MinimizeBox(div);
			}

			if (args['speaker']) {
				$('#' + args['speaker']).addClass(localStorage.getItem(args['speaker']));
			}

			div.fadeToggle('fast');

			// Stop propagation of key event out of inputs in this box to FOE
			$(`#${args['id']}`).on('keydown keyup', (e) => {
				e.stopPropagation();
			});

			// Brings the clicked window to the front
			$('body').on('click', '.window-box', function () {
				HTML.BringToFront($(this));
			});
		});
	},


	/**
	 * Click to minimise the box
	 *
	 * @param div
	 */
	MinimizeBox: (div) => {
		let btn = $(div).find('.window-minimize');

		$(btn).bind('click', function () {
			let box = $(this).closest('.window-box'),
				open = box.hasClass('open');

			if (open === true) {
				box.removeClass('open');
				box.addClass('closed');
				box.find('.window-body').css("visibility", "hidden");
			}
			else {
				box.removeClass('closed');
				box.addClass('open');
				box.find('.window-body').css("visibility", "visible");
			}
		});
	},


	Minimize: () => {
		$('body').find('#menu_box').removeClass('open');
		$('body').find('#menu_box').addClass('closed');
		$('#menu_box').find('.window-body').css("visibility", "hidden");
	},


	Maximize: () => {
		$('body').find("#menu_box").removeClass('closed');
		$('body').find("#menu_box").addClass('open');
		$('#menu_box').find('.window-body').css("visibility", "visible");
	},


	/**
	 * Handle minimizing helper during battle
	 */
	MinimizeBeforeBattle: () => {
		let HideHelperDuringBattle = localStorage.getItem('HideHelperDuringBattle');
		let MenuSetting = localStorage.getItem('SelectedMenu');
		if (HideHelperDuringBattle == 'true' && MenuSetting == 'Box' && $('body').find("#menu_box").hasClass('open')) {
			HTML.Minimize();
			HTML.boxWasMinimizedForBattle = true;
		}
	},


	MaximizeAfterBattle: () => {
		let MenuSetting = localStorage.getItem('SelectedMenu');
		if (MenuSetting == 'Box' && HTML.boxWasMinimizedForBattle) {
			HTML.Maximize();
			HTML.boxWasMinimizedForBattle = false;
		}
	},


	/**
	 * Makes an HTML BOX Dragable
	 *
	 * @param el
	 * @param save
	 */
	DragBox: (el, save = true) => {

		document.getElementById(el.id + "Header").removeEventListener("pointerdown", dragMouseDown);

		let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, top = 0, left = 0, id;

		id = el.id;

		if (document.getElementById(el.id + "Header")) {
			document.getElementById(el.id + "Header").onpointerdown = dragMouseDown;
		} else {
			el.onpointerdown = dragMouseDown;
		}

		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();

			pos3 = e.clientX;
			pos4 = e.clientY;

			document.onpointerup = closeDragElement;
			document.onpointermove = elementDrag;
		}

		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();

			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;

			top = (el.offsetTop - pos2);
			left = (el.offsetLeft - pos1);

			let noOverflow = $('.overflowHidden').length > 0;

			// Schutz gegen "zu Hoch geschoben"
			if (top < 0) {
				top = 0;
			}
			// Schutz gegen "zu weit links geschoben"
			if (left < Math.min(0,  120 - el.offsetWidth)) {
				left = Math.min(0,  120 - el.offsetWidth);
			}
			// Schutz gegen "zu weit rechts geschoben"
			if (left > Math.max(window.innerWidth - 80, window.innerWidth-el.offsetWidth) && noOverflow) {
				left = Math.max(window.innerWidth - 80, window.innerWidth-el.offsetWidth);
			}
			// Schutz gegen "zu weit runter geschoben"
			if (top > Math.max(window.innerHeight - 80, window.innerHeight-el.offsetHeight-20) && noOverflow) {
				top = Math.max(window.innerHeight - 80, window.innerHeight-el.offsetHeight-20);
			}

			el.style.top = top + "px";
			el.style.left = left + "px";

			if (save === true) {
				let cords = top + '|' + left;

				localStorage.setItem(id + 'Cords', cords);
			}
		}

		function closeDragElement() {
			document.onpointerup = null;
			document.onpointermove = null;

			// is there a callback function after drag&drop
			if (HTML.customFunctions[id]) {
				new Function(`${HTML.customFunctions[id]}`)();
			}
		}
	},


	/**
	 * Box can be resized
	 *
	 * @param id
	 * @param keepRatio
	 * @constructor
	 */
	Resizeable: (id, keepRatio) => {
		let box = $('#' + id),
			grip = $('<div />').addClass('window-grippy'),
			sizeLS = localStorage.getItem(id + 'Size');

		// Size was defined, set
		if (sizeLS !== null) {
			let s = sizeLS.split('|');

			// Does the box fit into the Viewport in terms of height?
			// No, height is set automatically, width taken over
			if ($(window).height() - s[1] < 20) {
				box.width(s[0]);
			}
			// ja, gespeicherte Daten sezten
			else {
				box.width(s[0]).height(s[1]);
			}
		}
		else {
			setTimeout(()=>{
				box.width(box.width()).height(box.height());
			}, 800);
		}

		box.append(grip);

		let options = {
			handles: {
				ne: '.window-grippy',
				se: '.window-grippy',
				sw: '.window-grippy',
				nw: '.window-grippy'
			},
			minHeight: 100,
			minWidth: 220,
			stop: (e, $el) => {
				let size = $el.element.width() + '|' + $el.element.height();

				localStorage.setItem(id + 'Size', size);
			}
		};

		// Except the "menu Box"
		if(id === 'menu_box')
		{
			options['minWidth'] = 101;
			options['minHeight'] = 87;
		}

		// keep aspect ratio
		if (keepRatio) {
			options['aspectRatio'] = box.width() + ' / ' + box.height();

			box.resizable(options);
		}

		// default
		else {
			box.resizable(options);
		}
	},


	SettingsBox: (id) => {

		let box = $('<div />').attr({
			id: `${id}SettingsBox`,
			class: 'settingsbox-wrapper'
		});

		$(`#${id}`).append(box);

		setTimeout(() => {
			new Function(`${HTML.customFunctions[id + 'Settings']}`)();
		}, 100);
	},


	PopOutBox: (id) => {
		new Function(`${HTML.customFunctions[id + 'PopOut']}`)();
	},


	MapBox: (id) => {
		setTimeout(() => {
			new Function(`${HTML.customFunctions[id + 'Map']}`)();
		}, 100);
	},


	/**
	 * Zweiter Klick auf das Menü-Icon schliesst eine ggf. offene Box
	 *
	 * @param cssid
	 * @returns {boolean}
	 */
	CloseOpenBox: (cssid) => {

		let box = $('#' + cssid);

		if (box.length > 0) {
			$(box).fadeToggle('fast', function () {
				$(this).remove();
			});
		}

		return false;
	},


	/**
	 * Bindet auf Wunsch eine weitere CSS eines Modules ein
	 *
	 * @param modul
	 */
	AddCssFile: (modul) => {
		// prüfen ob schon geladen
		if ($('#' + modul + '-css').length > 0) {
			return;
		}

		// noch nicht im DOM, einfügen
		let url = extUrl + 'js/web/' + modul + '/',
			cssUrl = url + 'css/' + modul + '.css?v=' + extVersion;

		let css = $('<link />')
			.attr('href', cssUrl)
			.attr('id', modul + '-css')
			.attr('rel', 'stylesheet');

		$('head').append(css);
	},


	/**
	 * Formatiert Zahlen oder gibt = 0 einen "-" aus
	 *
	 * @param number
	 * @returns {*}
	 */
	Format: (number) => {
		if (number === 0) {
			return '-';
		} else {
			return Number(number).toLocaleString(i18n('Local'));
		}
	},


	/**
	* Returns strong class for formating mopppel date
	*
	* @param Value
	* @param MinValue
	* @param MaxValue
	* @param Color1
	* @param Color2
	*/
	GetColorGradient: (Value, MinValue, MaxValue, Color1, Color2) => {
		let Factor2 = (Value - MinValue) / (MaxValue - MinValue);
		Factor2 = Math.max(Factor2, 0);
		Factor2 = Math.min(Factor2, 1);

		let Factor1 = 1 - Factor2;

		let Color1Int = parseInt(Color1, 16);
		let Color2Int = parseInt(Color2, 16);

		let Rgb1 = [Math.floor(Color1Int / 256 / 256), Math.floor(Color1Int / 256) % 256, Color1Int % 256];
		let Rgb2 = [Math.floor(Color2Int / 256 / 256), Math.floor(Color2Int / 256) % 256, Color2Int % 256];

		let RgbRet = [];
		for (let i = 0; i < 3; i++) {
			RgbRet[i] = Math.round(Rgb1[i] * Factor1 + Rgb2[i] * Factor2);
		}

		let ColorRet = RgbRet[0] * 256 * 256 + RgbRet[1] * 256 + RgbRet[2];

		let Ret = ColorRet.toString(16);
		while (Ret.length < 6) {
			Ret = '0' + Ret;
		}
		return Ret;
	},


	/**
	 * Ersetzt Variablen in einem String mit Argumenten
	 *
	 * @param string
	 * @param args
	 * @returns {*}
	 */
	i18nReplacer: (string, args) => {
		if (string === undefined || args === undefined) {
			return;
		}

		for (let key in args) {
			if (!args.hasOwnProperty(key)) {
				break;
			}

			const regExp = new RegExp('__' + key + '__', 'g');
			string = string.replace(regExp, args[key]);
		}
		return string;
	},


	/**
	* Ersetzt " durch &quot;
	*
	* @param string
	* @param args
	* @returns {*}
	*/
	i18nTooltip: (string) => {
		return string.replace(/"/g, "&quot;")
	},


	BringToFront: ($this) => {
		$('.window-box').removeClass('on-top');

		$this.addClass('on-top');
	},


	Dropdown: () => {

		for (const option of document.querySelectorAll(".custom-option")) {
			option.addEventListener('click', function () {
				if (!this.classList.contains('selected')) {
					let $this = $(this),
						txt = $this.text();

					$this.parent().find('.custom-option.selected').removeClass('selected');
					$this.addClass('selected');

					setTimeout(() => {
						$this.closest('.custom-select-wrapper').find('.trigger').text(txt);
					}, 150);
				}
			})
		}

		for (const dropdown of document.querySelectorAll(".custom-select-wrapper")) {
			dropdown.addEventListener('click', function () {
				this.querySelector('.custom-select').classList.toggle('dd-open');
			})
		}

		window.addEventListener('click', function (e) {
			for (const select of document.querySelectorAll('.custom-select')) {
				if (!select.contains(e.target)) {
					select.classList.remove('dd-open');
				}
			}
		});
	},


	EnterFullscreen: () => {

	},


	LeaveFullscreen: () => {

	},


	escapeHtml: (text)=> {
		return text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	},


	ShowToastMsg: (d) => {

		if (!Settings.GetSetting('ShowNotifications') && !d['show']) return;

		$.toast({
			heading: d['head'],
			text: d['text'],
			icon: d['type'],
			hideAfter: d['hideAfter'],
			position: Settings.GetSetting('NotificationsPosition', true),
			extraClass: localStorage.getItem('SelectedMenu') || 'bottombar',
			stack: localStorage.getItem('NotificationStack') || 4
		});
	},


	PopOutBoxBuilder: (params) => {

		let id = params['id'];

		const winHtml = `<!DOCTYPE html>
						<html>
							<head id="popout-${id}-head">
								<title>PopOut Test - ${i18n('Boxes.Outpost.Title')}</title>
								<link rel="stylesheet" href="${extUrl}css/web/variables.css">
								<link rel="stylesheet" href="${extUrl}css/web/boxes.css">
								<link rel="stylesheet" href="${extUrl}css/web/goods.css">
							</head>
							<body id="popout-${id}-body"></body>
						</html>`;

		const winUrl = URL.createObjectURL(
			new Blob([winHtml], { type: "text/html" })
		);

		const winObject = window.open(
			winUrl,
			`popOut-${id}`,
			`width=${params['width']},height=${params['height']},screenX=200,screenY=200`
		);

		return winObject;
	},


	ExportTable: (Table, Format, FileName) => {
		if (!Table || Table.length === 0) return;

		$(Table).each(function () {
			let ColumnNames = [];

			$(Table).find('th').each(function () {
				let ColumnCount = $(this).attr('colspan');
				if (ColumnCount) {
					ColumnCount = ColumnCount - 0;
				}
				else {
					ColumnCount = 1;
                }

				if (ColumnCount === 1) {
					ColumnNames.push($(this).attr('columnname'))
				}
				else {
					for (let i = 0; i < ColumnCount; i++) {
						ColumnNames.push($(this).attr('columnname' + (i + 1)));
					}
                }
			});

			let DataRows = [];
			$(Table).find('tr').each(function () {
				let CurrentRow = {};
				let ColumnID = 0;
				$(this).find('td').each(function () {
					if (ColumnNames[ColumnID]) { //skip if no columnname set
						let Key = ColumnNames[ColumnID];
						let Value;
						if ($(this).attr('exportvalue')) {
							Value = $(this).attr('exportvalue');
							Value = HTML.ParseFloatNonLocalIfPossible(Value);
						}
						else if ($(this).attr('data-number')) {
							Value = $(this).attr('data-number');
							Value = HTML.ParseFloatNonLocalIfPossible(Value);
						}
						else {
							Value = $(this).text();
							if (Value === '-') Value = '0';
							Value = HTML.ParseFloatLocalIfPossible(Value);
						}

						CurrentRow[Key] = Value;
					}

					let ColumnCount = $(this).attr('colspan');
					if (ColumnCount) {
						ColumnID += ColumnCount;
					}
					else {
						ColumnID += 1;
					}
					 ColumnCount;
				});

				if(Object.keys(CurrentRow).length > 0) DataRows.push(CurrentRow); //Dont push empty rows
			});

			let FileContent;
			if (Format === 'json') {
				FileContent = JSON.stringify(DataRows);
			}
			else if (Format === 'csv') {
				let Rows = [];

				let ValidColumnNames = ColumnNames.filter(function (a) { return a !== undefined });
				Rows.push(ValidColumnNames.join(';'));

				for (let i = 0; i < DataRows.length; i++) {
					let DataRow = DataRows[i];
					let CurrentCells = [];

					for (let j = 0; j < ValidColumnNames.length; j++) {
						let CurrentCell = DataRow[ValidColumnNames[j]];
						if (CurrentCell !== undefined) {
							if ($.isNumeric(CurrentCell)) {
								CurrentCells.push(Number(CurrentCell).toLocaleString(i18n('Local')));
							}
							else {
								CurrentCells.push(CurrentCell);
                            }
						}
						else {
							CurrentCells.push('');
                        }
					}
					Rows.push(CurrentCells.join(';'));
				}
				FileContent = Rows.join('\r\n');
			}
			else { //Invalid format
				return;
			}

			// with UTF-8 BOM
			let BlobData = new Blob(["\uFEFF" + FileContent], { type: "application/octet-binary;charset=ANSI" });
			MainParser.ExportFile(BlobData, FileName + '.' + Format);
		});
	},


	ParseFloatLocalIfPossible: (NumberString) => {
		if (HTML.IsReversedFloatFormat === undefined) { //FloatFormat bestimmen, wenn noch unbekannt
			let ExampleNumberString = Number(1.2).toLocaleString(i18n('Local'))
			if (ExampleNumberString.charAt(1) === ',') {
				HTML.IsReversedFloatFormat = true;
			}
			else {
				HTML.IsReversedFloatFormat = false;
			}
		}

		let Ret = NumberString;
		if (HTML.IsReversedFloatFormat) {
			Ret = Ret.replace(/\./g, "") //1000er Trennzeichen entfernen
			Ret = Ret.replace(/,/g, ".") //Komma ersetzen
		}
		else {
			Ret = Ret.replace(/,/g, "") //1000er Trennzeichen entfernen
		}

		let RetNumber = Number(Ret);
		if (isNaN(RetNumber)) {
			return NumberString;
		}
		else {
			return RetNumber;
		}
	},


	ParseFloatNonLocalIfPossible: (NumberString) => {
		let Ret = Number(NumberString);
		if (isNaN(Ret)) {
			return NumberString;
		}
		else {
			return Ret;
        }
	},
};
