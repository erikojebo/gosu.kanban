function loadBoard() {
    $.getJSON('/board', function(data) {

        $.each(data, function(index, swimlane) {

            $('#board').append('<dt>' + swimlane.name + '</dt>');

            var postitDd = $('<dd />');
            var postitList = $('<ul />');

            $.each(swimlane.postits, function(index, postit) {
                postitList.append($('<li>' + postit + '</li>'));
            });

            postitDd.append(postitList);
            $('#board').append(postitDd);
        });
    });
}