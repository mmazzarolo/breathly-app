package com.mmazzarolo.breathly.healthconnect

import android.app.Activity
import android.os.Bundle
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

class HealthConnectPermissionRationaleActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val density = resources.displayMetrics.density
    val padding = (24 * density).toInt()
    val content = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(padding, padding, padding, padding)
    }

    content.addView(
      TextView(this).apply {
        text = getString(R.string.health_connect_rationale_title)
        textSize = 24f
      },
      ViewGroup.LayoutParams.MATCH_PARENT,
      ViewGroup.LayoutParams.WRAP_CONTENT
    )
    content.addView(
      TextView(this).apply {
        text = getString(R.string.health_connect_rationale_message)
        textSize = 16f
        setPadding(0, (16 * density).toInt(), 0, (24 * density).toInt())
      },
      ViewGroup.LayoutParams.MATCH_PARENT,
      ViewGroup.LayoutParams.WRAP_CONTENT
    )
    content.addView(
      TextView(this).apply {
        text = getString(R.string.health_connect_privacy_policy_title)
        textSize = 20f
      },
      ViewGroup.LayoutParams.MATCH_PARENT,
      ViewGroup.LayoutParams.WRAP_CONTENT
    )
    content.addView(
      TextView(this).apply {
        text = getString(R.string.health_connect_privacy_policy)
        textSize = 16f
        setPadding(0, (16 * density).toInt(), 0, (24 * density).toInt())
      },
      ViewGroup.LayoutParams.MATCH_PARENT,
      ViewGroup.LayoutParams.WRAP_CONTENT
    )
    content.addView(
      Button(this).apply {
        text = getString(R.string.health_connect_rationale_close)
        setOnClickListener { finish() }
      },
      ViewGroup.LayoutParams.WRAP_CONTENT,
      ViewGroup.LayoutParams.WRAP_CONTENT
    )

    setContentView(
      ScrollView(this).apply { addView(content) },
      ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
    )
  }
}
