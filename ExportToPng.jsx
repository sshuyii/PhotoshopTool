//this script helps you export any layer or group in your psd file that end with ".png" to a separate png file:)

//usage: 
//1.name the group/layer you want to export as anyName.png (it has to end with ".png")
//2.change the variable in line14
//3.File-Scripts-Browse...


//Set Photoshop to use pixel measurements  
app.preferences.rulerUnits = Units.PIXELS  

var docRef = app.activeDocument;  
var newDocRef;

var newPath = "yourpath";//need to set a specific path
    
scanLayerSets(docRef);

function createNewDoc()
{
    if (app.documents.length > 0) {

        var docHeight = docRef.height;
        var docWidth = docRef.width;
        var docResolution = docRef.resolution;

        newDocRef = app.documents.add(docWidth, docHeight, docResolution, "Clipped Group", NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1.0, BitsPerChannelType.EIGHT, "test");
    }
}

//generate a new doc including only one layerSet named groupName
function duplicateGroupToDoc(layer) 
{
    createNewDoc();

    var x = docRef.layerSets.length;
    
    app.activeDocument = docRef;//set active document
    activeDocument.activeLayer = layer;

    newLayerSetRef = layer.duplicate(app.documents["Clipped Group"], ElementPlacement.PLACEATBEGINNING);  

    app.activeDocument = newDocRef;    
    newDocRef.activeLayer = newLayerSetRef;
    newLayerSetRef.name = layer.name;
}



function scanLayerSets(scanFile) 
{
    // find layer groups
    for(var i = 0; i < scanFile.layerSets.length; i++){
        var lsName = scanFile.layerSets[i].name;
        if(scanFile.layerSets[i].visible == true)
        {    
           if (lsName.substr(-4) == ".png") 
            {
                duplicateGroupToDoc(scanFile.layerSets[i]);//create a new doc including only one layer group
            
                newDocRef.mergeVisibleLayers(); 

                saveLayer(newDocRef.layers.getByName(lsName), lsName, newPath);
            }
            scanLayerSets(scanFile.layerSets[i]);
        }
        //  else {
        //     //recursive
        //     //works for .png group nests within non-png group
        //     scanLayerSets(scanFile.layerSets[i]);
        // }
    }
    


    // find plain layers in current group whose names end with .png
    for(var j = 0; j < scanFile.artLayers.length; j++) {
        var name = scanFile.artLayers[j].name;
        if (name.substr(-4) == ".png" && scanFile.artLayers[j].visible == true) {
            duplicateGroupToDoc(scanFile.artLayers[j]);
            saveLayer(newDocRef.layers.getByName(name), name, newPath);
        }
    }
}

function saveLayer(layer, layerName, path) {
    activeDocument.activeLayer = layer;
    activeDocument.trim(TrimType.TRANSPARENT,true,true,true,true);

    // var newLayerRef = newLayerSetRef.merge();
    // var shapeRef = newLayerRef.bounds;
    // newDocRef.crop(shapeRef);
    
    var saveFile = File(path + layerName);

    SavePNG(saveFile);
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}


function SavePNG(saveFile){
    var pngOpts = new ExportOptionsSaveForWeb; 
    pngOpts.format = SaveDocumentType.PNG
    pngOpts.PNG8 = false; 
    pngOpts.transparency = true; 
    pngOpts.interlaced = false; 
    pngOpts.quality = 100;
    activeDocument.exportDocument(new File(saveFile),ExportType.SAVEFORWEB,pngOpts); 
}
