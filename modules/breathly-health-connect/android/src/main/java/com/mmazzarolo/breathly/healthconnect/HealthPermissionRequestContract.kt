package com.mmazzarolo.breathly.healthconnect

import android.content.Context
import android.content.Intent
import androidx.health.connect.client.PermissionController
import expo.modules.kotlin.activityresult.AppContextActivityResultContract
import java.io.Serializable

internal data class HealthPermissionRequestInput(
  val permissions: ArrayList<String>
) : Serializable

internal class HealthPermissionRequestContract :
  AppContextActivityResultContract<HealthPermissionRequestInput, Set<String>> {
  private val contract = PermissionController.createRequestPermissionResultContract()

  override fun createIntent(context: Context, input: HealthPermissionRequestInput): Intent =
    contract.createIntent(context, input.permissions.toSet())

  override fun parseResult(
    input: HealthPermissionRequestInput,
    resultCode: Int,
    intent: Intent?
  ): Set<String> = contract.parseResult(resultCode, intent)
}
