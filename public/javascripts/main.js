console.log('hello world');

var picker = new Pikaday(
{
	field: document.getElementById('datepicker'),
	firstDay: 1,
	minDate: new Date('2000-01-01'),
	maxDate: new Date('2020-12-31'),
	yearRange: [2000,2020],
});

picker.setMoment(moment().dayOfYear(366));