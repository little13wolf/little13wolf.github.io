var playerCount = 0;
var teams = [];
var teamSums = [];
var averages = [];
var ranks = {
  "na": 0,
  "Unranked": 2,
  "Iron 1": 1,
  "Iron 2": 2,
  "Iron 3": 3,
  "Bronze 1": 4,
  "Bronze 2": 5,
  "Bronze 3": 6,
  "Silver 1": 7,
  "Silver 2": 8,
  "Silver 3": 9,
  "Gold 1": 10,
  "Gold 2": 11,
  "Gold 3": 12,
  "Platinum 1": 13,
  "Platinum 2": 14,
  "Platinum 3": 15,
  "Diamond 1": 16,
  "Diamond 2": 17,
  "Diamond 3": 18,
  "Immortal 1": 19,
  "Immortal 2": 20,
  "Immortal 3": 21,
  "Radiant": 22
};
var divisions = {
  "learning": 5,
  "owning": 13.5
}

function getGroupAverage(group) {
  var totalRank = 0;
  var size = 0;
  $.each(group, function(indx, player){
    size += 1;
    totalRank += player.rankVal;
  });
  var average = totalRank / size;

  return average;
}

function splitPlayers(fullGroup, numTeams) {
  // Create arrays for each team and each team Sum
  for (i = 0; i < numTeams; i++) {
    var num = i+1;
    var key = "team" + num;
    teams[key] = [];
    teamSums[key] = 0;
  }

  var nextTeam = 'team1';

  // For each player in the group, add them to a team
  for (r = 0; r < playerCount; r++) {
    // Get the next player
    var newPlayer = fullGroup.shift();
    
    // Add them to the Next Team and update Sums
    teams[nextTeam].push(newPlayer);
    teamSums[nextTeam] += newPlayer.rankVal;

    // Find the lowest team sum
    var lowestVal = 0 - 1;
    Object.keys(teamSums).forEach(function (key) {
      if (teamSums[key] < lowestVal || lowestVal < 0) {
        lowestVal = teamSums[key];
        nextTeam = key;
      }
    });
  }

  Object.keys(teams).forEach(function (key) {
    averages[key] = getGroupAverage(teams[key]);
  });
  
}

function readPlayerData(csvPlayers) {
  const csvResponses = $.csv.toObjects(csvPlayers);

  // Clear out our variables
  playerCount = 0;
  teams = [];
  teamSums = [];
  averages = [];

  var totalSum = totalAverage = 0;

  // Assign rankVals and count number of players
  playerCount = 0;
  $.each(csvResponses, function(indx, player) {
    player.rankVal = ranks[player.rank.trim()];
    playerCount++;
    totalSum += ranks[player.rank.trim()];
  });

  totalAverage = totalSum / playerCount;

  // Sort players by rank with highest being first
  var players = csvResponses.sort(function (a, b) {
    return -(a.rankVal - b.rankVal);
  });

  // Split players into n number of teams
  var numTeams = $('#numTeams').val();

  splitPlayers(players, numTeams);

  var output = "Overall Average: " + totalAverage + "\n\n";
  var teamsMessage = $('#discord-teams').val();
  var discordMessage = $('#discord-message').val() + "\n";
  Object.keys(teams).forEach(function (key) {
    var team = teams[key];
    output += key + "\n";
    teamsMessage += "\n**" + key + "**\n";
    $.each(team, function(idx, player) {
      output += player.name + " : " + player.rank + "(" + player.rankVal + ")\n";
      discordMessage += "@" + player.name + "\n";
      teamsMessage += "@" + player.name + "\n";
    });
    output += "Average: " + averages[key] + "\n\n";
  });

  $('#results').val(output);
  $("#discord-message").val(discordMessage);
  $('#discord-teams').val(teamsMessage);

  if ($('#showPFF')[0].checked) {
    $('#pffMessages').toggleClass('hide');
  } else if (!$('#pffMessages').hasClass('hide')) {
    $('#pffMessages').addClass('hide');
  }
}

function sortTeams() {
  // Read in player data
  const reader = new FileReader();
  const data = "";
  var csvFile = $('#csvUpload').prop('files')[0];
  if (csvFile) {
    reader.addEventListener('load', (event) => {
      var results = event.target.result.split("\n");
      results[0] = "name,rank";
      results = results.join("\n");
      readPlayerData(results);
    });
    reader.readAsText(csvFile);
  } else if ($('#input').val()) {
    var inputVal = "name,rank\n" + $('#input').val();
    readPlayerData(inputVal);
  } else {
    alert("No player data found.");
  }
}

function changeEntryType(event) {
  event.preventDefault();
  var link = $(event.target);
  var parent = link.parent();
  var sibling = $(parent.siblings()[0]);
  var sibLink = $(sibling.children()[0]);

  link.toggleClass('active');
  sibLink.toggleClass('active');

  var linkTarget = link.attr('href');
  var sibTarget = sibLink.attr('href');

  $(linkTarget).toggleClass('hide');
  $(sibTarget).toggleClass('hide');

}

function rateTeam() {
  var div = divisions[$("select[name='division']").val()];
  
  var currentRanks = $("select[name='current']").map(function(){return $(this).val();}).get();
  var act2Ranks = $("select[name='act2']").map(function(){return $(this).val();}).get();

  var team = getScores(currentRanks, act2Ranks);
  var mains = team.slice(0,5);
  if (team.lenth > 5){
    var substitutes = team.slice(-2);
  }

  var maxTAM = calculateTAM(team);
  var minTAM = calculateTAM(team, "min");
  var mainTAM = calculateTAM(mains);

  var canPlay = "";
  if (maxTAM <= div) {
    canPlay = "Yes!";
  } else if (maxTAM > div) {
    canPlay = "No! You're team is too powerful for this division!";
  }

  var output = "Division: " + $("select[name='division']").val();
  output += "\nCan this team play in that division? " + canPlay;
  output += "\n\nMain Team Score: " + mainTAM + "\nTeam Max: " + maxTAM + "\nTeam Min: " + minTAM + "\n\n";
  $("#results").val(output);

}

function getScores(current, act2) {
  var team = [];
  for (i=0; i<current.length; i++) {
    var cur = ranks[current[i]];
    var a2 = ranks[act2[i]];

    team[i] = (cur + a2)/2;
  }
  return team;
}

function calculateTAM(team, type="max"){
  if (type == "max") {
    team = team.sort(function(a, b){return b-a}).slice(0,5);
  } else {
    team = team.sort(function(a, b){return a-b}).slice(0,5);
  }

  var sum = 0;
  for (i=0;i<team.length;i++) {
    sum += team[i];
  }

  return sum / team.length;
}
