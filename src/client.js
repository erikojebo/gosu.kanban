function loadBoard() {
    $.getJSON('/board', function(data) {

        $.each(data, function(index, swimlane) {

            var swimlaneDiv = $('<div class="swimlane"><h2>' + swimlane.name + '</h2></div>');
            var postitList = $('<ul />');

            $.each(swimlane.postits, function(index, postit) {
                var deleteLink = $('<a>x</a>');

                deleteLink.click(function () {
                    $.ajax({
                        url: '/postit?text=' + encodeURI(postit),
                        type: 'DELETE',
                        success: function(result) {
                            alert("deleted");
                        }
                    });
                });
                
                var listItem = $('<li />');
                listItem.append(postit);
                listItem.append(deleteLink);
                postitList.append(listItem);
            });

            swimlaneDiv.append(postitList);
            $('#board').append(swimlaneDiv);
        });
    });
}