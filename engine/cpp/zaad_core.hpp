#pragma once
#include <string>
#include <vector>
namespace zaad {
struct DayProgress { std::string date; int completed_pages; int completed_habits; };
int total_completed(const std::vector<DayProgress>& days);
int current_streak(const std::vector<DayProgress>& days);
int clamp_counter(int value);
}