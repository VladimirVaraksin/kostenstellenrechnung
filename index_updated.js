// Referenzen zu den Buttons
const addHilfskostenstelleButton = document.getElementById("add-hilfskostenstelle");
const addEndkostenstelleButton = document.getElementById("add-endkostenstelle");
const restartButton = document.getElementById("restart");
const exportButton = document.getElementById("export");
// Container für die Kostenstellen
let hilfskostenstellenContainer = document.getElementById("hilfskostenstellen");
let endkostenstellenContainer = document.getElementById("endkostenstellen");

//let hilfskostenstellen = [];
//let endkostenstellen = [];

// Funktion zum Aktualisieren der Target-IDs nach dem Löschen einer Kostenstelle
function updateTargetIdsAfterDeletion(deletedId) {
    const blocks = document.querySelectorAll(".input-group");
    blocks.forEach(block => {
        if (block.innerHTML.includes("Leistung an")) {
            const inputs = block.querySelector("input");
            const id = inputs.id;
            const value = inputs.value;
            let targetId;
            let parentIndex;
            const match = id.match(/hilfs-leistung-(.+)-(\d+)/);
            if (match) {
                targetId = match[1];// Ziel-ID
                parentIndex = match[2]; // Parent-Index
                if (match[1].substring(0, 1) === deletedId.substring(0, 1) && parseInt(match[1].substring(1)) > parseInt(deletedId.substring(1))) {
                    targetId = targetId.substring(0, 1) + (parseInt(targetId.substring(1)) - 1);
                    block.innerHTML = `
                    <label for="hilfs-leistung-${targetId}-${parentIndex}">Leistung an ${targetId}:</label>
                    <input type="number" id="hilfs-leistung-${targetId}-${parentIndex}" name="hilfs-leistung-${targetId}-${parentIndex}" value ="${value}" placeholder="Leistung an ${targetId}" min="0">
                `;
                }
            }

        }
    });
}


// Funktion, um neue Hilfskostenstelle hinzuzufügen
function addHilfskostenstelle() {
    const newIndex = hilfskostenstellenContainer.children.length + 1;
    const newBlock = document.createElement("div");
    newBlock.className = "block hilfskostenstelle";
    newBlock.id = `h${newIndex}`;

    newBlock.innerHTML = `
        <h2>${newIndex}. Hilfskostenstelle</h2>
        <div class="input-group">
            <label for="hilfs-name-${newIndex}">Name:</label>
            <input type="text" id="hilfs-name-${newIndex}" name="hilfs-name-${newIndex}" placeholder="Name der Hilfskostenstelle">
        </div>
        <div class="input-group">
            <label for="hilfs-primaere-kosten-${newIndex}">Primäre Kosten:</label>
            <input type="number" id="hilfs-primaere-kosten-${newIndex}" name="hilfs-primaere-kosten-${newIndex}" placeholder="Primäre Kosten" min="0">
        </div>
    `;
    hilfskostenstellenContainer.appendChild(newBlock);
    updateDropdowns();
}

// Funktion, um neue Endkostenstelle hinzuzufügen
function addEndkostenstelle() {
    const newIndex = endkostenstellenContainer.children.length + 1;
    const newBlock = document.createElement("div");
    newBlock.className = "block endkostenstelle";
    newBlock.id = `e${newIndex}`;

    newBlock.innerHTML = `
        <h2>${newIndex}. Endkostenstelle</h2>
        <div class="input-group">
            <label for="end-name-${newIndex}">Name:</label>
            <input type="text" id="end-name-${newIndex}" name="end-name-${newIndex}" placeholder="Name der Endkostenstelle">
        </div>
        <div class="input-group">
            <label for="end-primaere-kosten-${newIndex}">Primäre Kosten:</label>
            <input type="number" id="end-primaere-kosten-${newIndex}" name="end-primaere-kosten-${newIndex}" placeholder="Primäre Kosten" min="0">
        </div>
    `;

    endkostenstellenContainer.appendChild(newBlock);
    updateDropdowns();
}

// Funktion, um Dropdown-Optionen zu aktualisieren
function updateDropdowns() {
    const hilfsElements = Array.from(hilfskostenstellenContainer.children);
    const endElements = Array.from(endkostenstellenContainer.children);

    // IDs und Beschriftungen aktualisieren
    hilfsElements.forEach((hilfsElement, index) => {
        const newId = `h${index + 1}`;
        const oldId = hilfsElement.id;
        hilfsElement.id = newId;
        hilfsElement.querySelector("h2").textContent = `${index + 1}. Hilfskostenstelle`;
        hilfsElement.querySelectorAll("input").forEach(input => {
            if (!input.id.includes("hilfs-leistung")) {
                const parts = input.id.split("-");
                input.id = `${parts[0]}-${parts[1]}-${index + 1}`;
                input.name = `${parts[0]}-${parts[1]}-${index + 1}`;
            }
        });

        // Aktualisiere die IDs in anderen Feldern, die auf diese Hilfskostenstelle verweisen
        const allRelatedFields = document.querySelectorAll(`[id*="-${oldId}-"]`);
        allRelatedFields.forEach(field => {
            if (!field.id.includes("hilfs-leistung")) {
                field.id = field.id.replace(`-${oldId}-`, `-${newId}-`);
                field.name = field.name.replace(`-${oldId}-`, `-${newId}-`);
            }
        });
    });

    endElements.forEach((endElement, index) => {
        endElement.id = `e${index + 1}`;
        endElement.querySelector("h2").textContent = `${index + 1}. Endkostenstelle`;
        endElement.querySelectorAll("input").forEach(input => {
            const parts = input.id.split("-");
            input.id = `${parts[0]}-${parts[1]}-${index + 1}`;
            input.name = `${parts[0]}-${parts[1]}-${index + 1}`;
        });
    });

    // Hilfskostenstellen-Dropdowns aktualisieren
    hilfsElements.forEach((hilfsElement, hilfsIndex) => {
        let dropdown = hilfsElement.querySelector("select");
        if (!dropdown) {
            dropdown = document.createElement("select");
            dropdown.addEventListener("change", (event) => {
                addLeistungsfeld(hilfsElement, hilfsIndex + 1, event.target.value);
            });
            hilfsElement.appendChild(dropdown);
        }

        dropdown.innerHTML = "<option value='' disabled selected>Leistung an...</option>";

        endElements.forEach((endElement, endIndex) => {
            dropdown.innerHTML += `<option value="e${endIndex + 1}">Endkostenstelle ${endIndex + 1}</option>`;
        });

        hilfsElements.forEach((otherHilfsElement, otherHilfsIndex) => {
            if (otherHilfsIndex === hilfsIndex) return;
            dropdown.innerHTML += `<option value="h${otherHilfsIndex + 1}">Hilfskostenstelle ${otherHilfsIndex + 1}</option>`;
        });
    });

    // Dropdowns für das Löschen aktualisieren
    updateDeleteDropdown("delete-hilfskostenstelle", hilfsElements, "Hilfskostenstelle");
    updateDeleteDropdown("delete-endkostenstelle", endElements, "Endkostenstelle");
}

// Funktion, um Dropdown-Listen für das Löschen zu aktualisieren
function updateDeleteDropdown(dropdownId, elements, label) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = `<label>${label} löschen:</label><option value='' disabled selected>Kostenstelle löschen...</option>`;

    elements.forEach((element) => {
        dropdown.innerHTML += `<option value="${element.id}">${element.querySelector("h2").textContent}</option>`;
    });
}

// Funktion, um ein neues Leistungsfeld hinzuzufügen
function addLeistungsfeld(parentElement, parentIndex, targetId) {
    const existingField = parentElement.querySelector(`#hilfs-leistung-${targetId}-${parentIndex}`);
    if (existingField) return;

    const inputGroup = document.createElement("div");
    inputGroup.className = "input-group";
    inputGroup.innerHTML = `
        <label for="hilfs-leistung-${targetId}-${parentIndex}">Leistung an ${targetId}:</label>
        <input type="number" id="hilfs-leistung-${targetId}-${parentIndex}" name="hilfs-leistung-${targetId}-${parentIndex}" placeholder="Leistung an ${targetId}" min="0">
    `;

    parentElement.appendChild(inputGroup);
}

// Funktion, um eine Kostenstelle zu löschen
function deleteKostenstelle(dropdownId, container) {
    const dropdown = document.getElementById(dropdownId);
    const selectedId = dropdown.value;

    if (!selectedId) return;

    const elementToDelete = document.getElementById(selectedId);
    if (!elementToDelete) return;

    const confirmation = confirm(`Möchten Sie die ${selectedId} löschen?`);
    if (confirmation) {
        // Entferne alle Eingabefelder in anderen Blöcken, die zu dieser Kostenstelle gehören
        const allRelatedFields = document.querySelectorAll(`[id*="${selectedId}-"]`);
        allRelatedFields.forEach(field => field.parentElement.remove());

        //anpasse alle Input Felder
        updateTargetIdsAfterDeletion(selectedId);

        // Entferne die Kostenstelle selbst

        container.removeChild(elementToDelete);

        updateDropdowns();
    }
}

function anbauverfahren(vart) {
    let endkostenstellen = getArrayEndkostenstellen();
    let hilfskostenstellen = getArrayHilfskostenstellen();

    for (const hkst of hilfskostenstellen) {
        if (hkst.leistungen.length !== 0 && hkst.leistungen.every(leistung => leistung.id.startsWith("h"))) {
            hkst.vstz = hkst.primaereGK / hkst.gesamtLeistung;
            for (const leistung of hkst.leistungen) {
                const hkst2 = returnHilfskostenstelle(leistung.id, hilfskostenstellen);
                if (hkst2 === null) {
                    continue;
                }
                hkst2.sekundaereGK += Math.round(hkst.vstz * leistung.leistung * 100) / 100;
            }
        }
    }

    for (const hkst of hilfskostenstellen) {
        let leistung_an_endkostenstellen = 0;
        for (const leistung of hkst.leistungen) {
            if (leistung.id.startsWith("e")) {
                leistung_an_endkostenstellen += leistung.leistung;
            }
        }
        if (leistung_an_endkostenstellen === 0) {continue;}
        hkst.vstz = (hkst.primaereGK + hkst.sekundaereGK) / leistung_an_endkostenstellen;
        for (const ekst of endkostenstellen) {
            let leistung_an_endkostenstellen = findeLeistung(ekst.id, hkst);
            let umlage = hkst.vstz * leistung_an_endkostenstellen;
            ekst.sekundaereGK += Math.round(umlage * 100) / 100;
        }
    }
    displayTable(vart, hilfskostenstellen, endkostenstellen);
}
function returnHilfskostenstelle(id, hksten) {
    for (const hkst of hksten) {
        if (hkst.id === id) {
            return hkst;
        }
    }
    return null;
}

function findeLeistung(id, hkst) {
        for (const leistung of hkst.leistungen) {
            if (leistung.id === id) {
                return leistung.leistung;
            }
        }

    return 0;
}

function gleichungsverfahren() {
    let endkostenstellen = getArrayEndkostenstellen();
    let hilfskostenstellen = getArrayHilfskostenstellen();

    const anzUnbekannten = hilfskostenstellen.length;
    if (anzUnbekannten === 0 || anzUnbekannten === 1) {
        anbauverfahren("Gleichungsverfahren");
        return;
    }
    const ar = new Array(anzUnbekannten).fill(null).map(() => new Array(anzUnbekannten+1).fill(0));
    for (const hkst of hilfskostenstellen) {
        let i = hilfskostenstellen.indexOf(hkst);
        for (let j = 0; j < anzUnbekannten; j++) {
            if (j === i) {
                ar[i][j] = - hkst.gesamtLeistung;
            }
            for (const leistung of hilfskostenstellen[j].leistungen) {
                if (leistung.id === hkst.id) {
                    ar[i][j] = leistung.leistung;
                    break;
                }
            }
        }
        ar[i][anzUnbekannten] = - hkst.primaereGK;
    }
    console.log(ar);
    let ergs = gleichungenLoesen(ar);
    console.log(ergs);

    for (const hkst of hilfskostenstellen) {
        for (const ekst of endkostenstellen) {
            let umlage = ergs[hilfskostenstellen.indexOf(hkst)] * findeLeistung(ekst.id, hkst);
            ekst.sekundaereGK += Math.round(umlage * 100) / 100;
        }
    }
    displayTable("Gleichungsverfahren", hilfskostenstellen, endkostenstellen);
}

function gleichungenLoesen(ar) {
    const n = ar.length;
    const ergs = new Array(n);

    // Vorwärts-Elimination (Gauss)
    for (let i = 0; i < n; i++) {
        // Pivotisierung: Größtes Element in der Spalte nach oben bringen
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(ar[k][i]) > Math.abs(ar[maxRow][i])) {
                maxRow = k;
            }
        }

        // Zeilen tauschen
        [ar[i], ar[maxRow]] = [ar[maxRow], ar[i]];

        // Falls der Pivotelement Null ist, gibt es keine eindeutige Lösung
        if (Math.abs(ar[i][i]) < 1e-10) {
            console.log("Keine eindeutige Lösung oder unlösbares Gleichungssystem");
        }

        // Normieren der Zeile
        for (let j = i + 1; j < n; j++) {
            const factor = ar[j][i] / ar[i][i];
            for (let k = i; k <= n; k++) {
                ar[j][k] -= factor * ar[i][k];
            }
        }
    }

    // Rückwärtseinsetzung
    for (let i = n - 1; i >= 0; i--) {
        let sum = ar[i][n];
        for (let j = i + 1; j < n; j++) {
            sum -= ar[i][j] * ergs[j];
        }
        ergs[i] = sum / ar[i][i];
    }

    return ergs;
}

function getArrayEndkostenstellen() {
    const endkostenstellen = [];

    // Kinder des Endkostenstellencontainers abrufen
    const children = endkostenstellenContainer.children;

    // Durchlauf aller Kinder (Endkostenstellen-Elemente)
    for (let child of children) {
        const id = child.id; // ID des Blocks, z. B. "e1", "e2" usw.
        const nameInput = child.querySelector('input[id^="end-name-"]');
        const kostenInput = child.querySelector('input[id^="end-primaere-"]');
        if (id && nameInput && kostenInput) {
            const name = nameInput.value.trim(); // Name der Endkostenstelle
            const primaereGK = parseFloat(kostenInput.value) || 0; // Primäre Gemeinkosten

            // Neues Objekt der Klasse Endkostenstelle erstellen
            const endkostenstelle = new Endkostenstelle(id, name, primaereGK);
            endkostenstellen.push(endkostenstelle);
        }
    }
    return endkostenstellen;
}

function getArrayHilfskostenstellen() {
    const hilfskostenstellen = [];

    // Kinder des Hilfskostenstellencontainers abrufen
    const children = hilfskostenstellenContainer.children;

    // Für jedes Kind (Hilfskostenstelle) durchlaufen
    for (let child of children) {
        const id = child.id; // ID des Blocks, z. B. "h1", "h2" usw.
        const nameInput = child.querySelector('input[id^="hilfs-name-"]');
        const kostenInput = child.querySelector('input[id^="hilfs-primaere-"]');

        // Leistungen suchen und array erstellen
        const leistungen = [];
        const leistungInputs = child.querySelectorAll('input[id^="hilfs-leistung-"]');

        leistungInputs.forEach(input => {
            const match = input.id.match(/hilfs-leistung-(\w+)-(\d+)/); // ID format: hilfs-leistung-targetId-parentIndex
            if (match) {
                const targetId = match[1]; // Ziel-ID
                const leistungValue = parseFloat(input.value) || 0; // Leistung (Zahl) oder 0
                leistungen.push({ id: targetId, leistung: leistungValue }); // Leistung hinzufügen
            }
        });

        if (id && nameInput && kostenInput) {
            const name = nameInput.value.trim(); // Name der Hilfskostenstelle
            const primaereGK = parseFloat(kostenInput.value) || 0; // Primäre Gemeinkosten

            // Neues Objekt der Klasse Hilfskostenstelle erstellen
            const hilfskostenstelle = new Hilfskostenstelle(id, name, primaereGK, leistungen);
            hilfskostenstellen.push(hilfskostenstelle);
        }
    }
    return hilfskostenstellen;
}

function deleteDuplicateTable(verrechnungsArt) {
    const element = document.getElementById(verrechnungsArt);
    if (element == null) return;
    let parent = element.parentNode;
    parent.parentNode.removeChild(parent);
}

// Funktion zur Anzeige der Tabelle
function displayTable(verrechnungArt, hilfskostenstellen, endkostenstellen) {
    deleteDuplicateTable(verrechnungArt);
    // Erstelle das Tabellen-HTML
    const tableContainer = document.createElement('div');
    tableContainer.setAttribute("class", "tableContainer");

    const table = document.createElement('table');
    table.setAttribute("id", verrechnungArt);
    table.setAttribute("class", "exportTable");

    // Tabellenkopf erstellen
    const headerRow = document.createElement('tr');

    const headerArt = document.createElement('th');
    headerArt.textContent = verrechnungArt;
    headerRow.appendChild(headerArt);

    // Füge Namen der Hilfskostenstellen hinzu
    hilfskostenstellen.forEach(hkst => {
        const th = document.createElement('th');
        th.textContent = hkst.name + " (Hilfskostenstelle)";
        headerRow.appendChild(th);
    });

    // Füge Namen der Endkostenstellen hinzu
    endkostenstellen.forEach(ekst => {
        const th = document.createElement('th');
        th.textContent = ekst.name + " (Endkostenstelle)";
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    // Zeilen für primäre, sekundäre und Gesamtkosten erstellen
    const kostenarten = ['Primäre Kosten', 'Sekundäre Kosten', 'Gesamtkosten'];
    kostenarten.forEach(kostenart => {
        const row = document.createElement('tr');

        const rowHeader = document.createElement('td');
        rowHeader.textContent = kostenart;
        row.appendChild(rowHeader);

        // Werte für Hilfskostenstellen hinzufügen
        hilfskostenstellen.forEach((hkst) => {
            const td = document.createElement('td');
            if (Number.isNaN(hkst.sekundaereGK) || Number.isNaN(hkst.primaereGK)) {
                td.textContent = "---";
            }
            else if (kostenart === "Primäre Kosten") {
                td.textContent = hkst.primaereGK + "";
            } else {
                td.textContent = "---";
            }
            row.appendChild(td);
        });

        // Werte für Endkostenstellen hinzufügen
        endkostenstellen.forEach((ekst) => {
            const td = document.createElement('td');
             if (kostenart === "Primäre Kosten") {
                td.textContent = ekst.primaereGK + "";
            } else if (kostenart === "Sekundäre Kosten") {
                 if (Number.isNaN(ekst.sekundaereGK)) {
                    td.textContent = "---";
                 } else {
                     td.textContent = Math.round(ekst.sekundaereGK * 100) / 100 + "";
                 }
            } else {
                 if (Number.isNaN(ekst.sekundaereGK)) {
                     td.textContent = "---";
                 } else {
                     td.textContent = ekst.primaereGK + Math.round(ekst.sekundaereGK * 100) / 100 + "" + "";
                 }
            }
            row.appendChild(td);
        });

        table.appendChild(row);
    });
    const buttonsContainer = document.createElement('div');
    buttonsContainer.setAttribute("class", "tableButtons-container");


    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Tabelle löschen';
    deleteButton.onclick = function () {
        deleteDuplicateTable(verrechnungArt);
        checkRemoveExport();
    };



    const exportButton = document.createElement('button');
    exportButton.textContent = 'Tabelle als CSV exportieren';
    exportButton.onclick = function () {
        exportToCSV(verrechnungArt)
    };




    tableContainer.appendChild(table);
    tableContainer.appendChild(buttonsContainer);
    buttonsContainer.appendChild(deleteButton);
    buttonsContainer.appendChild(exportButton);
    document.body.appendChild(tableContainer);
}
function checkRemoveExport() {
    const tables = document.querySelectorAll(".exportTable");
    if (tables.length === 0) {
        document.getElementById("export").style.display = "none";
    }
}

function checkInputFelder() {
    const hilfsElements = Array.from(hilfskostenstellenContainer.children);
    const endElements = Array.from(endkostenstellenContainer.children);

    hilfsElements.forEach((element) => {
        let inputElements = element.querySelectorAll('input');
        inputElements.forEach((input) => {
            if (!input.id.includes("name")) {
                if (parseFloat(input.value) < 0 || isNaN(parseFloat(input.value))) {
                    input.value = "0";
                }
            }
        });
    })

    endElements.forEach((element) => {
        let inputElements = element.querySelectorAll('input');
        inputElements.forEach((input) => {
            if (!input.id.includes("name")) {
                if (parseFloat(input.value) < 0 || isNaN(parseFloat(input.value))) {
                    input.value = "0";
                }
            } else {
                if (input.value.trim() === "margostkwismar12345") {
                    confirm("Margo ist nicht nur meine beste Freundin, sondern auch mein Fels in der Brandung. \n" +
                        "Sie hat mir so oft geholfen, immer ein offenes Ohr und ein riesiges Herz. \n" +
                        "Ohne sie wäre vieles nur halb so schön! Bitte bestätigen, dass Margo topchik ist");
                }
            }
        });
    })
}




function exportToCSV(tableId = null) {
    let csvContent = "";
    let tables;

    if (tableId) {
        // Nur die Tabelle mit der angegebenen ID exportieren
        let table = document.getElementById(tableId);
        if (!table) {
            console.error("Tabelle mit ID " + tableId + " nicht gefunden.");
            return;
        }
        tables = [table];
    } else {
        // Alle Tabellen exportieren
        tables = document.querySelectorAll(".exportTable");
    }

    tables.forEach((table, index) => {
        let tableName = table.getAttribute("data-table-name") || `Tabelle ${index + 1}`;
        csvContent += `${tableName}\n`;

        let rows = table.querySelectorAll("tr");

        rows.forEach(row => {
            let cols = row.querySelectorAll("th, td");
            let rowData = Array.from(cols).map(col => `"${col.innerText}"`).join(",");
            csvContent += rowData + "\n";
        });

        csvContent += "\n"; // Leerzeile zwischen Tabellen
    });

    if (csvContent === "") {
        console.error("Keine Daten zum Exportieren gefunden.");
        return;
    }

    // CSV-Datei als Blob speichern
    let blob = new Blob([csvContent], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = tableId ? `table_${tableId}.csv` : "tables_export.csv";
    link.click();
}


function stufenleiterverfahren() {
    let endkostenstellen = getArrayEndkostenstellen();
    let hilfskostenstellen = getArrayHilfskostenstellen();

    if (hilfskostenstellen.length <= 1) {
        anbauverfahren("Stufenleiterverfahren");
        return;
    }

    for (const hkst of hilfskostenstellen) {
        hkst.vstz = hkst.primaereGK / hkst.gesamtLeistung;
    }

    for (const hkst of hilfskostenstellen) {
        for (const hkst2 of hilfskostenstellen) {
            for (const leistung of hkst2.leistungen) {
                if (hkst.id === leistung.id) {
                    hkst.erhalteneLeistung += leistung.leistung * hkst2.vstz;
                }
            }
        }
    }

    //sortieren
    hilfskostenstellen.sort((a, b) => {
        return a.erhalteneLeistung - b.erhalteneLeistung;
    });
    console.log(hilfskostenstellen);

    let hilfskostenstellen_abgerechnet = [];

    for (const hkst of hilfskostenstellen) {
        hilfskostenstellen_abgerechnet.push(hkst.id);
        hkst.vstz = ( hkst.primaereGK + hkst.sekundaereGK ) / (hkst.gesamtLeistung - findeAbgerechneteLeistung(hkst, hilfskostenstellen_abgerechnet));
        console.log(hkst.vstz);
        hkst.sekundaereGK = 0;

        for (const hkst2 of hilfskostenstellen) {
            if (hilfskostenstellen_abgerechnet.includes(hkst2.id) || hkst2 === hkst) continue; {}
            let leistung = findeLeistung(hkst2.id, hkst);
            let umlage = hkst.vstz * leistung;
            hkst2.sekundaereGK += Math.round(umlage * 100) / 100;
            console.log(hkst2.sekundaereGK);
        }

        for (const ekst of endkostenstellen) {
            let umlage = hkst.vstz * findeLeistung(ekst.id, hkst);
            console.log(umlage);
            console.log(ekst.sekundaereGK);
            console.log(findeLeistung(ekst.id, hkst));
            ekst.sekundaereGK += Math.round(umlage * 100) / 100;
            console.log(ekst.sekundaereGK);
        }

    }
    displayTable("Stufenleiterverfahren", hilfskostenstellen, endkostenstellen);
}

function findeAbgerechneteLeistung(hkst, hilfskostenstellen_abgerechnet) {
    let leistungen = 0;
    for( const leistung of hkst.leistungen) {
        if (hilfskostenstellen_abgerechnet.includes(leistung.id)) {
            leistungen += leistung.leistung;
        }
    }
    return leistungen;
}

// Event Listener für die Buttons
addHilfskostenstelleButton.addEventListener("click", addHilfskostenstelle);
addEndkostenstelleButton.addEventListener("click", addEndkostenstelle);

// Event Listener für die Lösch-Dropdowns
const deleteHilfskostenstelleDropdown = document.createElement("select");
deleteHilfskostenstelleDropdown.id = "delete-hilfskostenstelle";
addHilfskostenstelleButton.parentElement.appendChild(deleteHilfskostenstelleDropdown);
deleteHilfskostenstelleDropdown.addEventListener("change", () => {
    deleteKostenstelle("delete-hilfskostenstelle", hilfskostenstellenContainer);
});
deleteHilfskostenstelleDropdown.addEventListener("mousedown", () => {
    deleteKostenstelle("delete-hilfskostenstelle", hilfskostenstellenContainer);
});

const deleteEndkostenstelleDropdown = document.createElement("select");
deleteEndkostenstelleDropdown.id = "delete-endkostenstelle";
addEndkostenstelleButton.parentElement.appendChild(deleteEndkostenstelleDropdown);
deleteEndkostenstelleDropdown.addEventListener("change", () => {
    deleteKostenstelle("delete-endkostenstelle", endkostenstellenContainer);
});
deleteEndkostenstelleDropdown.addEventListener("mousedown", () => {
    deleteKostenstelle("delete-endkostenstelle", endkostenstellenContainer);
});

restartButton.addEventListener("click", () => {
    location.reload();
});

exportButton.addEventListener("click", () => {
    exportToCSV();
})


const berechnen_button = document.getElementById("calculate");
berechnen_button.addEventListener("click", () => {
    if (endkostenstellenContainer.children.length > 0 && hilfskostenstellenContainer.children.length > 0) {
        const selectedId = document.getElementById("verrechnungsart").value;
        let exportButton = document.getElementById("export");
        exportButton.style.display = "block";
        checkInputFelder();
        if (selectedId === "Anbauverfahren") {
            anbauverfahren("Anbauverfahren");
        }else if (selectedId === "Stufenleiterverfahren") {
            stufenleiterverfahren();
        } else if (selectedId === "Gleichungsverfahren") {
            gleichungsverfahren();
        }
    }
})
// Initiale Dropdown-Aktualisierung
updateDropdowns();




//OO
class Kostenstelle {
    constructor(id, name, primaereGK) {
        if (new.target === Kostenstelle) {
            throw new Error("Kostenstelle is an abstract class and cannot be instantiated directly.");
        }
        this.id = id;
        this.name = name;
        this.primaereGK = primaereGK;
        this.sekundaereGK = 0;
    }
}

class Endkostenstelle extends Kostenstelle {
    constructor(id, name, primaereGK) {
        super(id, name, primaereGK);
    }
}

class Hilfskostenstelle extends Kostenstelle {
    constructor(id, name, primaereGK, leistungen) {
        super(id, name, primaereGK);
        this.leistungen = leistungen;
        this.vstz = 0;
        this.gesamtLeistung = this.calcLeistung(leistungen);
        this.erhalteneLeistung = 0;
    }

    calcLeistung(leistungen) {
        return leistungen.reduce((sum, leistung) => sum + leistung.leistung, 0);
    }
}
