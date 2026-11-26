import XCTest

final class HorariosUITests: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    private func tab(_ app: XCUIApplication, _ name: String) -> XCUIElement {
        app.webViews.buttons.matching(NSPredicate(format: "label CONTAINS[c] %@", name)).firstMatch
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
        XCTAssertTrue(app.webViews.textFields.matching(NSPredicate(format: "placeholderValue CONTAINS[c] %@", "Buscar materia")).firstMatch.waitForExistence(timeout: 15))
        openTab(app, "Cursado")
        XCTAssertTrue(app.webViews.textFields.matching(NSPredicate(format: "placeholderValue CONTAINS[c] %@", "Filtrar materia")).firstMatch.waitForExistence(timeout: 15))
        openTab(app, "Correlativas")
        XCTAssertTrue(app.webViews.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] %@", "Seleccionar materia")).firstMatch.waitForExistence(timeout: 15))
        openTab(app, "Alumno")
        XCTAssertTrue(app.webViews.textFields.matching(NSPredicate(format: "placeholderValue CONTAINS[c] %@", "Buscar materia")).firstMatch.waitForExistence(timeout: 15))
    }
}
