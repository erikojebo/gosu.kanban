function deletePostit(postit) {

    var listItems = $('li span');

    var matchingListItems = $.grep(listItems, function (x, i) {
        return $(x).html() === postit;
    });

    $.each(matchingListItems, function(i, x) {
        $(x).parent().fadeOut(300, function () {
            $(x).remove();
        });
    });

}

function appendPostit(postit, postitList) {

    var deleteLink = $('<a href="#">x</a>');

    deleteLink.click(function () {

        event.preventDefault();

        $.ajax({
            url: '/postit?text=' + encodeURI(postit),
            type: 'DELETE',
            success: function(result) {
                deletePostit(postit)
            }
        });
    });

    var listItem = $('<li />');
    var span = $('<span />');

    listItem.hover(function (event) {
        $(this).children('a').fadeIn(150);
    }, function (event) {
        $(this).children('a').fadeOut(150);
    });

    deleteLink.hide();

    span.append(postit);

    listItem.append(deleteLink);
    listItem.append(span);
    postitList.append(listItem);
}

function addSwimlane(swimlane) {
    var swimlaneDiv = $('<div class="swimlane"><h2>' + swimlane.name + '</h2></div>');
    var postitList = $('<ul />');

    $.each(swimlane.postits, function(index, postit) {
        appendPostit(postit, postitList);
    });

    swimlaneDiv.append(postitList);
    $('#board').append(swimlaneDiv);
}

function loadBoard() {
    $.getJSON('/board', function(data) {

        $.each(data, function(index, swimlane) {
            addSwimlane(swimlane);
        });
    });
}

