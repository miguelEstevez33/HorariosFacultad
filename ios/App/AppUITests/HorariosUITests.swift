import XCTest

final class HorariosUITests: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    private func tab(_ app: XCUIApplication, _ name: String) -> XCUIElement {
        app.buttons.matching(NSPredicate(format: "label CONTAINS[c] %@", name)).firstMatch
    }

    private func openTab(_ app: XCUIApplication, _ name: String) {
        let button = tab(app, name)
        XCTAssertTrue(button.waitForExistence(timeout: 20), "No se encontró la pestaña \(name)")
        button.tap()
    }

    func testLaunchAndNavigation() {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.webViews.firstMatch.waitForExistence(timeout: 30))
        XCTAssertTrue(tab(app, "Alumno").waitForExistence(timeout: 20))
        XCTAssertTrue(app.textFields.matching(NSPredicate(format: "placeholderValue CONTAINS[c] %@", "Buscar materia")).firstMatch.waitForExistence(timeout: 15))
        openTab(app, "Cursado")
        XCTAssertTrue(app.textFields.matching(NSPredicate(format: "placeholderValue CONTAINS[c] %@", "Filtrar materia")).firstMatch.waitForExistence(timeout: 15))
        openTab(app, "Correlativas")
        XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] %@", "Seleccionar materia")).firstMatch.waitForExistence(timeout: 15))
        openTab(app, "Alumno")
        XCTAssertTrue(app.textFields.matching(NSPredicate(format: "placeholderValue CONTAINS[c] %@", "Buscar materia")).firstMatch.waitForExistence(timeout: 15))
    }
    private func field(_ app: XCUIApplication, _ placeholder: String) -> XCUIElement {
        app.textFields.matching(NSPredicate(format: "placeholderValue CONTAINS[c] %@", placeholder)).firstMatch
    }

    private func search(_ app: XCUIApplication, _ placeholder: String, _ query: String) {
        let input = field(app, placeholder)
        XCTAssertTrue(input.waitForExistence(timeout: 20))
        input.tap()
        input.typeText(query)
        XCTAssertEqual(input.value as? String, query, "El buscador no recibió el texto esperado")
        let done = app.buttons.matching(NSPredicate(format: "label == %@", "Done")).firstMatch
        if done.exists && done.isHittable { done.tap() }
        let subject = app.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] %@", "Geometr")).firstMatch
        for _ in 0..<4 {
            if subject.exists { break }
            app.swipeUp()
        }
        XCTAssertTrue(subject.waitForExistence(timeout: 20), "La materia no apareció tras filtrar por \(query). Jerarquía: \(app.debugDescription)")
    }

    private func tapVisible(_ element: XCUIElement, in app: XCUIApplication) {
        for _ in 0..<6 {
            if element.exists { break }
            app.swipeUp()
        }
        XCTAssertTrue(element.waitForExistence(timeout: 20), "No se encontró el control: \(element). Jerarquía: \(app.debugDescription)")
        for _ in 0..<8 {
            if element.isHittable { break }
            app.swipeUp()
        }
        for _ in 0..<8 {
            if element.isHittable { break }
            app.swipeDown()
        }
        XCTAssertTrue(element.isHittable, "El control no es accesible mediante toque: \(element.debugDescription)")
        element.tap()
    }

    private func toggleControl(_ app: XCUIApplication, _ label: String) -> XCUIElement {
        let predicate = NSPredicate(format: "label == %@", label)
        let toggle = app.switches.matching(predicate).firstMatch
        if toggle.exists { return toggle }
        let button = app.buttons.matching(predicate).firstMatch
        if button.exists { return button }
        return toggle
    }

    private func progress(_ app: XCUIApplication) -> XCUIElement {
        app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", "/ 36 obligatorias")).firstMatch
    }

    private func approvedCount(_ app: XCUIApplication) throws -> Int {
        let element = progress(app)
        XCTAssertTrue(element.waitForExistence(timeout: 20))
        return try XCTUnwrap(Int(element.label.split(separator: "/")[0].trimmingCharacters(in: .whitespacesAndNewlines)))
    }

    private func expectProgress(_ app: XCUIApplication, _ count: Int) {
        let element = app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "\(count) / 36 obligatorias")).firstMatch
        XCTAssertTrue(element.waitForExistence(timeout: 20), "El progreso no refleja \(count) materias aprobadas")
    }

    func testSubjectStatusAndPersistence() throws {
        let app = XCUIApplication()
        app.launch()
        openTab(app, "Alumno")
        search(app, "Buscar materia", "Geometr")
        let none = toggleControl(app, "Sin cursar - Materia 2")
        tapVisible(none, in: app)
        XCTAssertEqual(none.value as? String, "1", "Sin cursar no quedó seleccionado")
        let baseline = try approvedCount(app)
        let approved = toggleControl(app, "Aprobado - Materia 2")
        tapVisible(approved, in: app)
        XCTAssertEqual(approved.value as? String, "1", "Aprobado no quedó seleccionado")
        expectProgress(app, baseline + 1)
        app.terminate()
        app.launch()
        expectProgress(app, baseline + 1)
        search(app, "Buscar materia", "Geometr")
        XCTAssertEqual(approved.value as? String, "1", "El estado aprobado no persistió")
        tapVisible(none, in: app)
        expectProgress(app, baseline)
    }

    func testScheduleEnrollmentAndExport() {
        let app = XCUIApplication()
        app.launch()
        openTab(app, "Alumno")
        search(app, "Buscar materia", "Geometr")
        tapVisible(toggleControl(app, "Sin cursar - Materia 2"), in: app)
        // Reiniciar la vista para eliminar el filtro y volver al inicio.
        app.terminate()
        app.launch()
        openTab(app, "Cursado")
        search(app, "Filtrar materia", "Geometr")
        let subject = app.buttons.matching(NSPredicate(format: "label BEGINSWITH[c] %@ AND label CONTAINS[c] %@", "Seleccionar", "Geometr")).firstMatch
        tapVisible(subject, in: app)
        let remove = app.buttons.matching(NSPredicate(format: "label BEGINSWITH[c] %@", "Quitar ")).firstMatch
        if remove.exists { tapVisible(remove, in: app) }
        let commission = toggleControl(app, "Comisión 1K1 Anual")
        tapVisible(commission, in: app)
        XCTAssertTrue(remove.waitForExistence(timeout: 20), "La comisión no quedó inscripta")
        let export = app.buttons.matching(NSPredicate(format: "label == %@", "Exportar horario")).firstMatch
        XCTAssertTrue(export.waitForExistence(timeout: 20))
        XCTAssertTrue(export.isEnabled)
        tapVisible(export, in: app)
        // Buscar una acción del menú nativo en español o inglés.
        let nativeAction = app.buttons.matching(NSPredicate(format: "label IN %@", ["Copy", "Copiar", "Save to Files", "Guardar en Archivos", "Save Image", "Guardar imagen", "AirDrop"])).firstMatch
        XCTAssertTrue(nativeAction.waitForExistence(timeout: 30), "No se detectó el menú nativo de compartir")
    }
}
