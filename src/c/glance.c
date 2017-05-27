#include "pebble.h"

#define NUM_MENU_SECTIONS 1
#define NUM_FIRST_MENU_ITEMS 6

// 'light.kitchen_table_light'

char *kitchen = "kitchen_table_light";
char *sofa = "sofa_light";
char *dormitory = "light_dorm";
char *livingRoom = "light_living_room";

char* device_ids[4];

static Window *s_main_window;
static SimpleMenuLayer *s_simple_menu_layer;
static SimpleMenuSection s_menu_sections[NUM_MENU_SECTIONS];
static SimpleMenuItem s_first_menu_items[NUM_FIRST_MENU_ITEMS];

static bool s_bool_status = false;
static char *s_status = "";

// Request a state change for the Lockitron (Unlock/Lock)
static void prv_toggle_remote(int deviceId) {
  DictionaryIterator *out;
  AppMessageResult result = app_message_outbox_begin(&out);
  if (result != APP_MSG_OK) {
    //text_layer_set_text(s_txt_layer, "Outbox Failed");
  }
  
  // deviceId++;
  s_status = s_bool_status ? "1":"0";
  
  char str[80];
  snprintf(str, sizeof(str), "%s", device_ids[deviceId]);
  APP_LOG(APP_LOG_LEVEL_INFO, str);
  
  dict_write_cstring(out, MESSAGE_KEY_DEVICE_UUID, str);
  dict_write_cstring(out, MESSAGE_KEY_STATUS, s_status);

  result = app_message_outbox_send();
  if (result != APP_MSG_OK) {
  }
}

static void menu_select_callback(int index, void *ctx) {
  s_bool_status = !s_bool_status;
  s_first_menu_items[index].subtitle = s_bool_status ? "On":"Off";
  layer_mark_dirty(simple_menu_layer_get_layer(s_simple_menu_layer));  
  prv_toggle_remote(index);
}

static void prv_inbox_received_handler(DictionaryIterator *iter, void *context) {
  Tuple *ready_tuple = dict_find(iter, MESSAGE_KEY_APP_READY);
  if (ready_tuple) {
    if(launch_reason() == APP_LAUNCH_USER || launch_reason() == APP_LAUNCH_QUICK_LAUNCH) {
      // Toggle the Lockitron!
      // prv_lockitron_toggle_state();
    } else {
      // Application was just installed, or configured
      // text_layer_set_text(s_txt_layer, "App Installed");
    }
    return;
  }
}

static void prv_init_app_message() {
  // Initialize AppMessage
  app_message_register_inbox_received(prv_inbox_received_handler);
  app_message_open(256, 256);
}

static void main_window_load(Window *window) {
  // Although we already defined NUM_FIRST_MENU_ITEMS, you can define
  // an int as such to easily change the order of menu items later
  int num_a_items = 0;
  s_first_menu_items[num_a_items++] = (SimpleMenuItem) {
    .title = "Couch Lights",
    .callback = menu_select_callback,
  };
  s_first_menu_items[num_a_items++] = (SimpleMenuItem) {
    .title = "Kitchen Table",
    .callback = menu_select_callback,
  };
  s_first_menu_items[num_a_items++] = (SimpleMenuItem) {
    .title = "Dormitory Light",
    .callback = menu_select_callback,
  };
  s_first_menu_items[num_a_items++] = (SimpleMenuItem) {
    .title = "Living Room Light",
    .callback = menu_select_callback,
  };

  s_menu_sections[0] = (SimpleMenuSection) {
    .num_items = NUM_FIRST_MENU_ITEMS,
    .items = s_first_menu_items,
  };

  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_frame(window_layer);

  s_simple_menu_layer = simple_menu_layer_create(bounds, window, s_menu_sections, NUM_MENU_SECTIONS, NULL);

  layer_add_child(window_layer, simple_menu_layer_get_layer(s_simple_menu_layer));
}

void main_window_unload(Window *window) {
  simple_menu_layer_destroy(s_simple_menu_layer);
}

static void init() {
  device_ids[0] = sofa; 
  device_ids[1] = kitchen;
  device_ids[2] = dormitory;
  device_ids[3] = livingRoom;
  
  prv_init_app_message();
  s_main_window = window_create();  
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = main_window_load,
    .unload = main_window_unload,
  });
  window_stack_push(s_main_window, true);
}

static void deinit() {
  window_destroy(s_main_window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}