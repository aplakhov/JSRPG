function saveGameState(world, player, ui) {
    let w = JSON.stringify(world, (key, value) => { return key != 'pathfinding' && key != 'scriptObjects' && key != 'vision'? value : undefined });
    let p = JSON.stringify(player)
    let dialogs = JSON.stringify(ui.dialogUI.messages)
    let goals = JSON.stringify({
        'done': ui.goals.done,
        'started': ui.goals.started 
    });
    console.log(w);
    console.log("World: ", w.length);
    console.log("Player: ", p.length);
    console.log("Dialogs: ", dialogs.length);
    console.log("Goals: ", goals.length);
    console.log("Total: ", w.length + p.length + dialogs.length + goals.length);
}
