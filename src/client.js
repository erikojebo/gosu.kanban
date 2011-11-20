function loadBoard() {
    $.getJSON('/board', function(data) {

        $.each(data, function(index, swimlane) {

            var swimlaneDiv = $('<div class="swimlane"><h2>' + swimlane.name + '</h2></div>');
            var postitList = $('<ul />');

            $.each(swimlane.postits, function(index, postit) {

                var deleteLink = $('<a href="#">x</a>');

                deleteLink.click(function () {

                    event.preventDefault();

                    $.ajax({
                        url: '/postit?text=' + encodeURI(postit),
                        type: 'DELETE',
                        success: function(result) {
                            alert("deleted");
                        }
                    });
                });
                
                var listItem = $('<li />');
                var span = $('<span />');

                span.append(postit);

                listItem.append(deleteLink);
                listItem.append(span);
                postitList.append(listItem);
            });

            swimlaneDiv.append(postitList);
            $('#board').append(swimlaneDiv);
        });
    });
}