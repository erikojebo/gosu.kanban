var currentSwimlane = null;
var dialogWidth = 0;

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

function enableShowWhenHoveredAnimation(element, parent) {
    $(parent).hover(function (event) {
        $(this).children('a.action').fadeIn(150);
    }, function (event) {
        $(this).children('a.action').fadeOut(150);
    });

    element.hide();
}

function appendPostit(postit, postitList) {

    var deleteLink = $('<a href="#" class="action">x</a>');

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

    enableShowWhenHoveredAnimation(deleteLink, listItem);

    span.append(postit);

    listItem.append(deleteLink);
    listItem.append(span);
    postitList.append(listItem);
}

function addSwimlane(swimlane) {
    var swimlaneDiv = $('<div class="swimlane">');
    var deleteLink = $('<a href="#" class="action">x</a>');
    var addPostitLink = $('<a href="#" class="action">+</a>');

    deleteLink.click(function() {
        $.ajax({
            url: '/swimlane?name=' + encodeURI(swimlane.name),
            type: 'DELETE',
            success: function(result) {
                deleteSwimlane(swimlane)
            }
        });
    });

        var addPostitDialog = $("#addPostitForm").dialog({
        width: dialogWidth,
        autoOpen: false,
        title: "Add Postit"
    });

    addPostitLink.click(function() {
        event.preventDefault();

        currentSwimlane = swimlane.name;

        addPostitDialog.dialog('open');
    });

    swimlaneDiv.append(deleteLink);
    swimlaneDiv.append(addPostitLink);
    swimlaneDiv.append($('<h2>' + swimlane.name + '</h2></div>'));

    enableShowWhenHoveredAnimation(deleteLink, swimlaneDiv);
    enableShowWhenHoveredAnimation(addPostitLink, swimlaneDiv);

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

function initializePage() {
    dialogWidth = $("#addPostitForm").css("width");
    loadBoard(); 
}