#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;

#define appBg [UIColor colorWithRed: 0.00 green: 0.59 blue: 0.53 alpha: 1.00]

@end
