#include <algorithm>
#include <cstdint>
extern "C" {
int zaad_clamp_counter(int value) { return std::max(0, value); }
int zaad_completed_total(int pages, int habits) {
    return std::max(0, pages) + std::max(0, habits);
}
int zaad_page_goal_remaining(int completed_pages) {
    return std::max(0, 6 - std::clamp(completed_pages, 0, 6));
}
}
