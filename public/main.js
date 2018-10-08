Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyAlvvCDPhV5aTMeH4vO36LQHotdXoN_2Og',
    libraries: 'places',
  },
  installComponents: true,
})

//https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
String.prototype.getHashCode = function() {
    var hash = 0;
    if (this.length == 0) return hash;
    for (var i = 0; i < this.length; i++) {
        hash = this.charCodeAt(i) + 1 + ((hash << 5) - hash);
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};
Number.prototype.intToHSL = function() {
    var shortened = this % 360;
    return "hsl(" + shortened + ",100%,30%)";
};


function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}

const VUEApp = new Vue({
    el: '#app',
    data: {
        url: "https://cloud.timeedit.net/kth/web/public01/ri10u387053Z5lQ535679Q05yZ075WZ1Q3Y68Q5Q10274.json",
        data: {},
        hasLoaded: false,
        selectedEvent: false,
        places: [],
        center: {lat:59.3494436, lng:18.0701329},
        pasteUrl: ""
    },
    computed: {
        events: function() {
            var list = []
            if (!this.hasLoaded) {
                console.log("not loaded")
                return list
            }
            for (var key in this.data.reservations) {
                var vm = this
                var event = this.data.reservations[key]
                var newEvent = {}
                var startDate = moment(event.startdate + " " + event.starttime)
                var endDate = moment(event.enddate + " " + event.endtime)
                newEvent.start = startDate
                newEvent.end = endDate
                newEvent.title = event.columns[0]
                newEvent.group = event.columns[1]
                newEvent.course = event.columns[2]
                newEvent.rooms = event.columns[3]
                newEvent.info = event.columns[4]
                newEvent.teachers = event.columns[5]
                newEvent.program = event.columns[6]
                newEvent.markers = []
                newEvent.backgroundColor = event.columns[0].getHashCode().intToHSL()
                var rooms = newEvent.rooms.split(", ")
                rooms.forEach(function(room) {
                    var roomInfo = vm.places.find(function(element) {
                        return element.timeeditCode == room;
                    });
                    if (roomInfo) {
                        var position = {lat: Number(roomInfo.latitude), lng: Number(roomInfo.longitude)}
                        newEvent.markers.push({position: position})
                    }
                })
                list.push(newEvent)
            }
            return list
        }
    },
    methods: {
        getSchema: function() {
            var vm = this
            httpGetAsync("/correcturl?url=" + vm.pasteUrl, (resultUrl) => {
                $.getJSON('/places', function (json) {
                    vm.places = json;
                    httpGetAsync(resultUrl, function(res) {
                        vm.data = JSON.parse(res)
                        vm.hasLoaded = true
                        Vue.nextTick(() => {
                            $('#calendar').fullCalendar({
                                defaultView: 'agendaWeek',
                                firstDay: 1,
                                editable: false,
                                header: false,
                                weekends: false,
                                events: vm.events,
                                minTime: '08:00:00',
                                maxTime: '20:00:00',
                                slotLabelFormat: 'HH:mm',
                                timeFormat: 'HH:mm',
                                allDaySlot: false,
                                contentHeight: 'auto',
                                eventRender: function(event, element) {
                                    element.append('<div class = "fc-title">' + event.course + '</div>');
                                    element.append('<div class = "fc-title">' + event.rooms + '</div>');
                                },
                                eventClick: vm.eventClick
                            }).css('font-family', 'Roboto')
                        })
                    });
                });
            })
        },
        eventClick: function(event, jsEvent, view) {
            var v = this
            v.selectedEvent = event;
            if (event.markers.length > 0) {
                v.center = event.markers[0].position
            }
        }
    },
    mounted: function() {
        var vm = this

    }
});

