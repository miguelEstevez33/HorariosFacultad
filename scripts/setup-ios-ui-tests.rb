require 'xcodeproj'
path = 'ios/App/App.xcodeproj'
project = Xcodeproj::Project.open(path)
app = project.targets.find { |t| t.name == 'App' } or abort 'App target missing'
target = project.targets.find { |t| t.name == 'AppUITests' }
unless target
  target = project.new_target(:ui_test_bundle, 'AppUITests', :ios, '13.0', nil, :swift)
  group = project.main_group.find_subpath('AppUITests', true)
  group.set_path('AppUITests')
  target.add_file_references([group.new_file('HorariosUITests.swift')])
  target.add_dependency(app)
end
target.build_configurations.each do |config|
  settings = config.build_settings
  settings['PRODUCT_NAME'] = 'AppUITests'
  settings['GENERATE_INFOPLIST_FILE'] = 'YES'
  settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.utnfrc.horariosisi.uitests'
  settings['SWIFT_VERSION'] = '5.0'
  settings['TARGETED_DEVICE_FAMILY'] = '1,2'
  settings['TEST_TARGET_NAME'] = 'App'
  settings['CODE_SIGNING_ALLOWED'] = 'NO'
end
project.root_object.attributes['TargetAttributes'] ||= {}
project.root_object.attributes['TargetAttributes'][target.uuid] = {'TestTargetID' => app.uuid}
project.save
scheme = Xcodeproj::XCScheme.new
scheme.configure_with_targets(app, target, launch_target: true)
scheme.save_as(project.path, 'AppUITests', true)
