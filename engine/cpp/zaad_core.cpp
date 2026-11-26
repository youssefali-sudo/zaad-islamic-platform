#include "zaad_core.hpp"
#include <algorithm>
namespace zaad {
int total_completed(const std::vector<DayProgress>& days){int total=0;for(const auto& d:days)total+=std::max(0,d.completed_pages)+std::max(0,d.completed_habits);return total;}
int current_streak(const std::vector<DayProgress>& days){int streak=0;for(const auto& d:days){if(d.completed_pages<=0&&d.completed_habits<=0)break;++streak;}return streak;}
int clamp_counter(int value){return std::max(0,value);}
}