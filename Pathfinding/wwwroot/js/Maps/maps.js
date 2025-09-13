$(function () {
    //INITIALIZE

    let table = $('#mapsTable').DataTable({

        "columns": [
            { "data": "name" },
            { "data": "description" },
            //MAP PREVIEW
            { "data": "image", "orderable": false, "searchable": false, "className": "text-center"},
            { "data": "actions", "orderable": false, "searchable": false , "className": "text-center" }
        ],
        "columnDefs": []

}       );

    //EVENTS

    //FUNCTIONS
});