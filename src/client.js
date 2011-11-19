function loadBoard() {
    $.getJSON('/board', function(data) {

        $.each(data, function(index, swimlane) {

            var swimlaneDiv = $('<div class="swimlane"><h2>' + swimlane.name + '</h2></div>');
            var postitList = $('<ul />');

            $.each(swimlane.postits, function(index, postit) {
                postitList.append($('<li>' + postit + '</li>'));
            });

            swimlaneDiv.append(postitList);
            $('#board').append(swimlaneDiv);
        });
    });
}