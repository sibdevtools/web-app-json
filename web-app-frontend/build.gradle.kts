import com.github.gradle.node.npm.task.NpmTask

plugins {
  alias(libs.plugins.node.gradle)
}

node {
  version.set("22.9.0")
  npmVersion.set("10.8.3")
  download.set(true)
}

tasks.register<NpmTask>("build") {
  group = "build"
  description = "Builds the React frontend using npm."
  dependsOn("npmInstall")
  args.set(listOf("run", "build"))
}
