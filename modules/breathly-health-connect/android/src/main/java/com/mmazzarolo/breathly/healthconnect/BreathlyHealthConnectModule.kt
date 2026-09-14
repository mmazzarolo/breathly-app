package com.mmazzarolo.breathly.healthconnect

import android.os.Build
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.HealthConnectFeatures
import androidx.health.connect.client.feature.ExperimentalMindfulnessSessionApi
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.MindfulnessSessionRecord
import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import expo.modules.kotlin.activityresult.AppContextActivityResultLauncher
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.time.Instant
import java.time.ZoneId

@OptIn(ExperimentalMindfulnessSessionApi::class)
class BreathlyHealthConnectModule : Module() {
  private val context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val writePermission =
    HealthPermission.getWritePermission(MindfulnessSessionRecord::class)

  override fun definition() = ModuleDefinition {
    Name("BreathlyHealthConnect")

    lateinit var permissionLauncher:
      AppContextActivityResultLauncher<HealthPermissionRequestInput, Set<String>>

    RegisterActivityContracts {
      permissionLauncher = registerForActivityResult(HealthPermissionRequestContract())
    }

    AsyncFunction("getStatusAsync") Coroutine { ->
      getStatus()
    }

    AsyncFunction("requestPermissionAsync") Coroutine { ->
      if (getStatus() != STATUS_PERMISSION_REQUIRED) return@Coroutine false

      val grantedPermissions = permissionLauncher.launch(
        HealthPermissionRequestInput(arrayListOf(writePermission))
      )
      grantedPermissions.contains(writePermission)
    }

    AsyncFunction("writeBreathingSessionAsync") Coroutine { startTimeMs: Double, endTimeMs: Double, clientRecordId: String ->
      val status = getStatus()
      if (status != STATUS_AUTHORIZED) return@Coroutine status
      if (
        !startTimeMs.isFinite() ||
        !endTimeMs.isFinite() ||
        startTimeMs < 0 ||
        endTimeMs <= startTimeMs ||
        clientRecordId.isBlank()
      ) {
        return@Coroutine STATUS_ERROR
      }

      val startTime = Instant.ofEpochMilli(startTimeMs.toLong())
      val endTime = Instant.ofEpochMilli(endTimeMs.toLong())
      val zoneRules = ZoneId.systemDefault().rules
      val record = MindfulnessSessionRecord(
        startTime = startTime,
        startZoneOffset = zoneRules.getOffset(startTime),
        endTime = endTime,
        endZoneOffset = zoneRules.getOffset(endTime),
        mindfulnessSessionType = MindfulnessSessionRecord.MINDFULNESS_SESSION_TYPE_BREATHING,
        title = context.getString(R.string.health_connect_session_title),
        metadata = Metadata.activelyRecorded(
          device = Device(
            type = Device.TYPE_PHONE,
            manufacturer = Build.MANUFACTURER,
            model = Build.MODEL,
          ),
          clientRecordId = clientRecordId,
          clientRecordVersion = 1L,
        ),
      )
      try {
        healthConnectClient().insertRecords(listOf(record))
        STATUS_SAVED
      } catch (_: SecurityException) {
        STATUS_PERMISSION_REQUIRED
      }
    }
  }

  private suspend fun getStatus(): String {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return STATUS_UNAVAILABLE

    when (HealthConnectClient.getSdkStatus(context)) {
      HealthConnectClient.SDK_UNAVAILABLE -> return STATUS_UNAVAILABLE
      HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> return STATUS_UPDATE_REQUIRED
    }

    val client = healthConnectClient()
    if (
      client.features.getFeatureStatus(HealthConnectFeatures.FEATURE_MINDFULNESS_SESSION) !=
        HealthConnectFeatures.FEATURE_STATUS_AVAILABLE
    ) {
      return STATUS_UNSUPPORTED
    }

    return if (client.permissionController.getGrantedPermissions().contains(writePermission)) {
      STATUS_AUTHORIZED
    } else {
      STATUS_PERMISSION_REQUIRED
    }
  }

  private fun healthConnectClient() = HealthConnectClient.getOrCreate(context)

  private companion object {
    const val STATUS_UNAVAILABLE = "unavailable"
    const val STATUS_UPDATE_REQUIRED = "updateRequired"
    const val STATUS_UNSUPPORTED = "unsupported"
    const val STATUS_PERMISSION_REQUIRED = "permissionRequired"
    const val STATUS_AUTHORIZED = "authorized"
    const val STATUS_SAVED = "saved"
    const val STATUS_ERROR = "error"
  }
}
