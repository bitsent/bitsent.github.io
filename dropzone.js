//// DROP ZONE SCRIPT
function dragover(e) {
    console.log('File(s) in drop zone');
    e.preventDefault();
}
dragenter = function dragenter(e) {
    if (e.target.id == "drop_zone") {
        e.target.classList.add("dragging");
    }
}
dragleave = function dragleave(e) {
    if (e.target.id == "drop_zone") {
        e.preventDefault();
        e.target.classList.remove("dragging");
    }
}
function getDroppedFiles(e) {
    e.preventDefault();
    dragleave(e);
    console.log('File(s) dropped');
    if (e.dataTransfer.items) {
        return filter(e.dataTransfer.items, i => i.kind == 'file')
            .map(i => i.getAsFile());
    } else {
        return e.dataTransfer.files
    }
}
function filter(items, condition) {
    result = []
    for (var i = 0; i < items.length; i++)
        if (condition(items[i]))
            result.push(items[i]);
    return result;
}
