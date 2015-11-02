var Slices = new Meteor.Collection(null);
Session.setDefault('pieChartSort','none');
Session.setDefault('pieChartSortModifier',undefined);

Template.pieResults.helpers({
  slice: function() {
    return Slices.find();
  },
  numSlices: function() {
    return BuiltBudgets.find().count();
  },
  sliceAvg: function(){
    console.log(this.key);
    return getAvg(BuiltBudgets.find().fetch(), this.key);
  }
});

totalBudget = 100;

getAvg = function(budgets, key){
  var sum = 0;
  for (var i=0; i<budgets.length; ++i) {
    var sum = sum + budgets[i][key];
  }
  return sum/budgets.length;
}

updateGraph = function (newVal, oldVal, key) {
  var slices = Slices.find({ key:{$ne:key} }).fetch();
  for (var i=0; i<slices.length; ++i) {
    Slices.update({_id:slices[i]._id}, {$set:{value: (slices[i].value-(newVal-oldVal)/slices.length) }});
  }
}

Template.form.events({
  'change input': function (e) {
    var tar = e.target;
    var oldVal = Slices.findOne({key:$(tar).closest('.budget-item').attr("id")}).value;
    Slices.update({_id:Slices.findOne({key:$(tar).closest('.budget-item').attr("id")})._id}, {$set:{value: tar.value}});
    updateGraph(tar.value, oldVal, $(tar).closest('.budget-item').attr("id"));
  },
  'click .lower-priority': function (e) {
    tar = e.target;
  },
  'click #submit-graph': function(e) {
    console.log('Submitting graph...');
    Meteor.call('submitGraph', Slices.find().fetch());
    $('#results').removeClass('hidden');
  }
});

Template.form.helpers({
  slices: function() {
    return Slices.find();
  },
  dollars: function() {
    var totalBudget = 4.5*1000000000;
    var dollars = totalBudget*(parseInt(this.value)/100);
    return "$"+numeral(dollars).format('0,0');
  }
});

Template.pieChart.events({
	'click #pts':function(){   
    Expenses.find({}).map(function(pt) {
      Slices.insert({
			  value:Math.floor(pt.amount)
      });
    });
  },
  'click #add':function(){
		Slices.insert({
			value:Math.floor(Math.random() * 100)
		});
	},
	'click #remove':function(){
		var toRemove = Random.choice(Slices.find().fetch());
		Slices.remove({_id:toRemove._id});
	},
	'click #randomize':function(){
		//loop through bars
		Slices.find({}).forEach(function(bar){
			//update the value of the bar
			Slices.update({_id:bar._id},{$set:{value:Math.floor(Math.random() * 100)}});
		});
	},
	'click #toggleSort':function(){
		if(Session.equals('pieChartSort', 'none')){
			Session.set('pieChartSort','asc');
			Session.set('pieChartSortModifier',{sort:{value:1}});
		}else if(Session.equals('pieChartSort', 'asc')){
			Session.set('pieChartSort','desc');
			Session.set('pieChartSortModifier',{sort:{value:-1}});
		}else{
			Session.set('pieChartSort','none');
			Session.set('pieChartSortModifier',{});
		}
	}
});

Template.form.rendered = function(){
  if(Slices.find({}).count() === 0){
    Slices.insert({
      label: 'Public Safety',
      key: 'publicSafety',
      value: "50" //parseInt($(items[i]).find('input[type="range"]').val()) //Math.floor(Math.random() * 100)
    });
    Slices.insert({
        label:'Transportation',
        key:'transportation',
        value: "20"
    });
    Slices.insert({
        label:'Health & Human Services',
        key:'healthAndHumanSvcs',
        value: "30"
    });
   /* Slices.insert({
        key:'Neighborhoods & Infrastructure',
        value: "20"
    });
    Slices.insert({
        key:'General Government',
        value: "10"
    });
    Slices.insert({
        key:'Culture & Recreation',
        value: "10"
    });
    Slices.insert({
        key:'Economic Development',
        value: "10"
    });*/
  }
}

Template.pieChart.rendered = function(){

	//Width and height
	var w = 300;
	var h = 300;

	var outerRadius = w / 2;
	var innerRadius = 0;
	var arc = d3.svg.arc()
					.innerRadius(innerRadius)
					.outerRadius(outerRadius);
	
	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) {
			return d.value;
		});
	
	//Easy colors accessible via a 10-step ordinal scale
	var color = d3.scale.category10();

	//Create SVG element
	var svg = d3.select("#pieChart")
				.attr("width", w)
				.attr("height", h);
	
	var key = function(d){ 
		return d.data._id;
	};

	Deps.autorun(function(){
		var modifier = {fields:{value:1}};
		var sortModifier = Session.get('pieChartSortModifier');
		if(sortModifier && sortModifier.sort)
			modifier.sort = sortModifier.sort;
		
		var dataset = Slices.find({},modifier).fetch();
		
		var arcs = svg.selectAll("g.arc")
					  .data(pie(dataset), key);

		var newGroups = 
			arcs
				.enter()
				.append("g")
				.attr("class", "arc")
				.attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");
		
		//Draw arc paths
    var bigArc = true;
		newGroups
			.append("path")
			.attr("fill", function(d, i) {
				return color(i);
			})
			.attr("d", arc);
		
		//Labels
		newGroups
			.append("text")
			.attr("transform", function(d) {
				return "translate(" + arc.centroid(d) + ")";
			})
			.attr("text-anchor", "middle")
			.text(function(d) {
				return d.value;
			});

		arcs
			.transition()
			.select('path')
			.attrTween("d", function(d) {
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					return arc(interpolate(t));
				};
			});
		
		arcs
			.transition()
			.select('text')
			.attr("transform", function(d) {
				return "translate(" + arc.centroid(d) + ")";
			})
			.text(function(d) {
				return d.value+"%";
			});

		arcs
			.exit()
	 		.remove();
	});
};
