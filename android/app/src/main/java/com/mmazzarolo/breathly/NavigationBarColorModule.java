package com.mmazzarolo.breathly;


import android.animation.ArgbEvaluator;
import android.animation.ValueAnimator;
import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.IllegalViewOperationException;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

public class NavigationBarColorModule extends ReactContextBaseJavaModule {
    private static final String REACT_CLASS = "NavigationBarColor";

    public NavigationBarColorModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    private void setNavigationBarTheme(Activity activity, Boolean light) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Window window = activity.getWindow();
            int flags = window.getDecorView().getSystemUiVisibility();
            if (light) {
                flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            } else {
                flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }
            window.getDecorView().setSystemUiVisibility(flags);
        }
    }


    @ReactMethod
    public void changeNavigationBarColor(final String color, final Boolean light, final Promise promise) {
        try {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        Activity currentActivity = getCurrentActivity();
                        if (currentActivity != null) {
                            final Window window = getCurrentActivity().getWindow();
                            Integer colorFrom = window.getNavigationBarColor();
                            Integer colorTo = Color.parseColor(String.valueOf(color));
                            ValueAnimator colorAnimation = ValueAnimator.ofObject(new ArgbEvaluator(), colorFrom, colorTo);
                            colorAnimation.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {

                                @Override
                                public void onAnimationUpdate(ValueAnimator animator) {
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                                        window.setNavigationBarColor((Integer) animator.getAnimatedValue());
                                    }
                                }

                            });
                            colorAnimation.start();
                            setNavigationBarTheme(currentActivity, light);
                            WritableMap map = Arguments.createMap();
                            map.putBoolean("success", true);
                            promise.resolve(map);
                        }

                    } else {
                        promise.reject("NOT_SUPPORTED", new Throwable("Not Supported"));
                    }
                }
            });

        } catch (IllegalViewOperationException e) {
            WritableMap map = Arguments.createMap();
            map.putBoolean("success", false);
            promise.reject("error", e);
        }

    }

}
