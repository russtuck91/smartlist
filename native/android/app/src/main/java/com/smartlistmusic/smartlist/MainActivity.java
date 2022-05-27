package com.smartlistmusic.smartlist;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate; // <- add this necessary import
//import com.facebook.react.ReactRootView;
import com.zoontek.rnbootsplash.RNBootSplash; // <- add this necessary import
// import org.devio.rn.splashscreen.SplashScreen;
//import androidx.core.splashscreen.SplashScreen;
import android.os.Bundle;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "SmartList";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // OLD way - this makes the "custom" xml splash screen show after the standard one. Does stick around til the WebView loads
    // SplashScreen.show(this);
  
    // SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
  
    super.onCreate(savedInstanceState);
    // installSplashScreen();
    // setContentView(R.layout.main_activity);

    // Attempt to keep splash screen up for X seconds
    // splashScreen.setKeepOnScreenCondition(() -> keep);
    // Handler handler = new Handler();
    // handler.postDelayed(() -> keep = false, 60 * 1000);
  }

  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegate(this, getMainComponentName()) {

      @Override
      protected void loadApp(String appKey) {
        RNBootSplash.init(MainActivity.this); // <- initialize the splash screen
        super.loadApp(appKey);
      }
    };
  }
}
