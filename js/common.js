var exportToPDF = function (id,name) {

    $('#' + id).tableExport({

        type:'pdf',

        ignoreRow: [0,1,2],

        fileName: name,

        jspdf: {

            autotable: {

                styles: {

                    overflow: 'linebreak',

                    fontSize: 10

                }

            }

        }

    });

};