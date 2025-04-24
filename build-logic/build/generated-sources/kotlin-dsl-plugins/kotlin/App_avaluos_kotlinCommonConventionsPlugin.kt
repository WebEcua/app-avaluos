/**
 * Precompiled [app.avaluos.kotlin-common-conventions.gradle.kts][App_avaluos_kotlin_common_conventions_gradle] script plugin.
 *
 * @see App_avaluos_kotlin_common_conventions_gradle
 */
public
class App_avaluos_kotlinCommonConventionsPlugin : org.gradle.api.Plugin<org.gradle.api.Project> {
    override fun apply(target: org.gradle.api.Project) {
        try {
            Class
                .forName("App_avaluos_kotlin_common_conventions_gradle")
                .getDeclaredConstructor(org.gradle.api.Project::class.java, org.gradle.api.Project::class.java)
                .newInstance(target, target)
        } catch (e: java.lang.reflect.InvocationTargetException) {
            throw e.targetException
        }
    }
}
